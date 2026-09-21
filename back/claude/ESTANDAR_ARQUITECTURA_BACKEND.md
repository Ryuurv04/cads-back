# Estándar de Arquitectura Backend

**Guía de Estructura, Patrones y Convenciones de Código**

*Versión:* 1.1  
*Última Actualización:* Julio 2026  
*Stack:* Node.js + Express + MySQL  
*Ámbito:* Todos los proyectos de Web-innova Studio

---

## Índice

1. [Estructura de carpetas](#1-estructura-de-carpetas)
2. [Las tres capas y su responsabilidad](#2-las-tres-capas-y-su-responsabilidad)
3. [Comentarios JSDoc obligatorios en Models](#3-comentarios-jsdoc-obligatorios-en-models)
4. [Flujo de dependencias](#4-flujo-de-dependencias)
5. [Queries compartidos — carpeta shared](#5-queries-compartidos--carpeta-shared)
6. [Helpers — funciones utilitarias transversales](#6-helpers--funciones-utilitarias-transversales)
7. [Middlewares obligatorios](#7-middlewares-obligatorios)
8. [Convenciones de nombrado](#8-convenciones-de-nombrado)
9. [Manejo de errores](#9-manejo-de-errores)
10. [Rutas](#10-rutas)
11. [Checklist antes de entregar código](#11-checklist-antes-de-entregar-código)

---

## 1. Estructura de carpetas

La organización es **por dominio**. No existe una carpeta `controllers` separada a nivel raíz. Cada dominio agrupa sus propias tres capas en una sola carpeta.

```
├── models/
│   ├── [dominio1]/
│   │   ├── [dominio1]Controller.js
│   │   ├── [dominio1]Service.js
│   │   └── [dominio1]Model.js
│   │
│   ├── [dominio2]/
│   │   ├── [dominio2]Controller.js
│   │   ├── [dominio2]Service.js
│   │   └── [dominio2]Model.js
│   │
│   └── shared/
│       ├── [consultaCompartida1].js
│       └── [consultaCompartida2].js
│
├── middlewares/
│   ├── authMiddleware.js       ← obligatorio en todo proyecto
│   ├── checkPermission.js      ← obligatorio en todo proyecto
│   └── [otroMiddleware].js     ← se agrega solo si es necesario
│
├-- helpers/
|  ├── emailHelper.js          ← envío de correos
|  ├── uuidHelper.js           ← generación de UUIDs
|  └── [otraUtilidad].js       ← cualquier función transversal
│
└── routes/
    ├── [dominio1]Routes.js
    └── [dominio2]Routes.js
```

**Reglas:**
- Cada dominio tiene exactamente 3 archivos — ni más, ni menos
- Si un dominio parece necesitar una capa extra, se discute antes de romper el patrón
- Los dominios se nombran en plural y minúscula: `usuarios`, `productos`, `pedidos`
- `shared/` contiene queries que usan dos o más dominios
- `helpers/` contiene funciones utilitarias que no pertenecen a ningún dominio
- `middlewares/` contiene los interceptores de rutas — mínimo siempre los dos obligatorios

---

## 2. Las tres capas y su responsabilidad

### Controller — `xController.js`

**Responsabilidad única: validar la entrada y dar la respuesta HTTP.**

- Valida que los campos requeridos de `req.body` / `req.params` / `req.query` existan
- Llama exactamente a **una función** del Service correspondiente
- Atrapa errores con `try/catch` y responde según `error.statusCode` si existe
- **Nunca** llama directamente a un Model
- **Nunca** contiene lógica de negocio

```javascript
// usuariosController.js
const UsuariosService = require('./usuariosService');

exports.login = (pool) => async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Se requiere email y contraseña.' });
    }

    const resultado = await UsuariosService.loginUsuario(pool, email, password);
    res.json(resultado);

  } catch (error) {
    console.error('Error en login:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error del servidor. Intente más tarde.' });
  }
};
```

---

### Service — `xService.js`

**Responsabilidad única: la lógica de negocio.**

- Contiene todas las decisiones — qué validar, qué calcular, qué reglas aplicar
- Puede llamar a su propio Model
- Puede llamar a Models de otros dominios cuando lo necesite
- Puede llamar a otros Services cuando la lógica lo requiera
- Puede llamar a funciones de `helpers/` para tareas utilitarias (enviar email, generar UUID, etc.)
- Lanza errores con `error.statusCode` para que el Controller los traduzca a HTTP
- **Nunca** construye queries SQL directamente — eso vive en el Model

```javascript
// usuariosService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuariosModel = require('./usuariosModel');
const emailHelper = require('../../helpers/emailHelper');

const JWT_SECRET = process.env.JWT_SECRET;

const loginUsuario = async (pool, email, password) => {
  const usuario = await UsuariosModel.buscarUsuarioPorEmail(pool, email);

  if (!usuario) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, usuario.password);
  if (!isMatch) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    cod_usuario: usuario.cod_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    message: 'Login exitoso',
    usuario: {
      cod_usuario: usuario.cod_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    },
  };
};

module.exports = { loginUsuario };
```

---

### Model — `xModel.js`

**Responsabilidad única: el query a la base de datos.**

- Recibe siempre `pool` como primer parámetro
- Cada función hace una sola operación de base de datos claramente nombrada
- **No** lanza errores de negocio (`statusCode`) — eso es responsabilidad del Service
- **No** contiene lógica de negocio ni decisiones condicionales
- Si un query lo necesitan dos o más dominios, se mueve a `shared/`
- **Toda función lleva JSDoc obligatorio** — ver sección 3

```javascript
// usuariosModel.js

/**
 * Busca un usuario por su correo electrónico
 * @param {Object} pool - Conexión a la base de datos
 * @param {string} email - Correo electrónico a buscar
 * @returns {Object|null} Datos del usuario o null si no existe
 */
const buscarUsuarioPorEmail = async (pool, email) => {
  const [rows] = await pool.execute(
    `SELECT cod_usuario, nombre, apellido, email, password
     FROM usuarios
     WHERE email = ? AND fecha_eliminado IS NULL`,
    [email]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo usuario en la base de datos
 * @param {Object} pool - Conexión a la base de datos
 * @param {Object} datos - Datos del usuario a crear
 * @param {string} datos.nombre - Nombre del usuario
 * @param {string} datos.apellido - Apellido del usuario
 * @param {string} datos.email - Correo electrónico, debe ser único
 * @param {string} datos.passwordHash - Contraseña encriptada con bcrypt
 * @returns {number} cod_usuario del registro recién insertado
 */
const crearUsuario = async (pool, { nombre, apellido, email, passwordHash }) => {
  const [result] = await pool.execute(
    `INSERT INTO usuarios (nombre, apellido, email, password)
     VALUES (?, ?, ?, ?)`,
    [nombre, apellido, email, passwordHash]
  );
  return result.insertId;
};

module.exports = { buscarUsuarioPorEmail, crearUsuario };
```

---

## 3. Comentarios JSDoc obligatorios en Models

Cada función exportada de un Model lleva un bloque JSDoc inmediatamente arriba, sin excepción.

**Formato fijo:**

```javascript
/**
 * [Una línea describiendo qué hace y para qué se usa]
 * @param {Object} pool - Conexión a la base de datos
 * @param {tipo} nombreParam - [Qué es, restricciones si aplica]
 * @returns {tipo} [Qué devuelve — objeto, null, array, insertId, boolean]
 */
```

**Reglas:**

| Regla | Detalle |
|-------|---------|
| `@param {Object} pool` | Siempre primero, sin excepción |
| Parámetros adicionales | Un `@param` por cada uno con tipo y descripción |
| Objetos desestructurados | Documentar cada propiedad con notación de punto: `@param {string} datos.nombre` |
| `@returns` | Siempre indicar qué pasa en el caso vacío — `null`, `[]`, `insertId` |
| Momento de escritura | Se escribe al mismo tiempo que la función, no después |

> ✅ Solo aplica a Models. Los Services y Controllers no necesitan JSDoc porque su lógica ya es legible por el flujo de código.

---

## 4. Flujo de dependencias

```
Controller  →  Service  →  Model
   │              │           │
   │              │           └── Solo queries. Sin lógica.
   │              │
   │              ├── Lógica de negocio. Puede llamar:
   │              │     - su propio Model
   │              │     - Models de otros dominios
   │              │     - otros Services
   │              │     - helpers/ para utilidades transversales
   │              │
   └── Solo valida entrada y responde HTTP.
       Llama a exactamente una función de Service.
       Nunca toca un Model ni un Helper directamente.
```

**Nunca permitido:**

| Prohibido | Por qué |
|-----------|---------|
| Controller llamando directo a un Model | Rompe la separación de responsabilidades |
| Controller llamando a un Helper | Las utilidades pasan siempre por el Service |
| Model llamando a un Service | Inversión de dependencias incorrecta |
| SQL dentro de un Controller o Service | Los queries viven solo en Models |
| Lógica de negocio dentro de un Model | Los Models solo leen y escriben datos |

---

## 5. Queries compartidos — carpeta `shared/`

Cuando dos o más dominios necesitan la misma consulta, ese query **no se escribe dos veces**. Se crea una función en `models/shared/` y los Services que lo necesiten la importan desde ahí.

**Cuándo mover a shared:**
- Dos dominios distintos necesitan el mismo JOIN
- Una búsqueda compuesta se repite en más de un archivo
- Un query de auditoría o control aplica a varios dominios

```javascript
// models/shared/usuarioConRol.js

/**
 * Obtiene los datos de un usuario junto con su rol activo
 * @param {Object} pool - Conexión a la base de datos
 * @param {number} codUsuario - Código interno del usuario
 * @returns {Object|null} Datos combinados de usuario y rol, o null si no existe
 */
const obtenerUsuarioConRol = async (pool, codUsuario) => {
  const [rows] = await pool.execute(
    `SELECT u.cod_usuario, u.nombre, u.apellido, u.email,
            r.cod_rol, r.nombre AS nombre_rol
     FROM usuarios u
     JOIN roles r ON r.cod_rol = u.cod_rol
     WHERE u.cod_usuario = ? AND u.fecha_eliminado IS NULL`,
    [codUsuario]
  );
  return rows[0] || null;
};

module.exports = { obtenerUsuarioConRol };
```

> ✅ **Regla práctica:** antes de escribir un query nuevo, revisar si algo parecido ya existe en `shared/` o en otro Model.

---

## 6. Helpers — funciones utilitarias transversales

Los helpers son funciones de utilidad que no pertenecen a ningún dominio pero que varios Services pueden necesitar. Viven en `helpers/` y se importan directamente desde los Services.

**Qué va en helpers:**
- Envío de correos electrónicos
- Generación de UUIDs
- Formateo de fechas
- Subida de archivos
- Generación de PDFs
- Cualquier función reutilizable sin lógica de negocio propia

**Qué NO va en helpers:**
- Lógica de negocio de un dominio específico
- Queries a la base de datos
- Validaciones de reglas de negocio

```javascript
// helpers/emailHelper.js

/**
 * Envía un correo electrónico usando la configuración de Nodemailer del proyecto
 * @param {Object} opciones - Opciones del correo
 * @param {string} opciones.destinatario - Email del destinatario
 * @param {string} opciones.asunto - Asunto del correo
 * @param {string} opciones.html - Cuerpo del correo en formato HTML
 * @returns {Promise<void>} Resuelve cuando el correo se envió exitosamente
 */
const enviarCorreo = async ({ destinatario, asunto, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destinatario,
    subject: asunto,
    html,
  });
};

module.exports = { enviarCorreo };
```

```javascript
// helpers/uuidHelper.js
const { v4: uuidv4 } = require('uuid');

/**
 * Genera un UUID v4 único para usar como identificador público
 * @returns {string} UUID v4 en formato string (ej. '550e8400-e29b-41d4-a716-446655440000')
 */
const generarUUID = () => uuidv4();

module.exports = { generarUUID };
```

> ✅ Los helpers se documentan con JSDoc igual que los Models, porque también son funciones reutilizables que otros deben entender sin leer la implementación.

---

## 7. Middlewares obligatorios

Todo proyecto tiene mínimo **dos middlewares**. Se crean desde el inicio, no cuando se necesitan.

### 7.1 authMiddleware — Validación de token

Verifica que el token JWT sea válido antes de dejar pasar la petición. Si el token no existe, está expirado o es inválido, rechaza la petición con `401`.

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // el payload del token queda disponible en req.usuario
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;
```

---

### 7.2 checkPermission — Validación de permisos por pantalla y nivel

Verifica que el rol del usuario autenticado tenga el nivel de acceso requerido para la pantalla solicitada. Siempre va después de `authMiddleware`.

**Sistema de niveles:**

| Nivel | Nombre | Qué permite |
|-------|--------|-------------|
| `0` | Sin acceso | No puede ver ni hacer nada en esta pantalla |
| `1` | Lectura | Solo puede consultar y ver datos |
| `2` | Edición | Puede consultar y modificar datos existentes |
| `3` | Total | Puede consultar, crear, editar y eliminar |

**Claves de pantalla:** se definen como constantes semánticas en mayúsculas — `'AGENDA_CITAS'`, `'GESTION_USUARIOS'`, `'CONFIG_CLINICA'`. Nunca se usan números ni IDs en las rutas.

```javascript
// middlewares/checkPermission.js

/**
 * Middleware que verifica si el rol del usuario tiene el nivel de acceso
 * requerido para una pantalla específica del sistema.
 *
 * @param {Object} pool - Conexión a la base de datos
 * @param {string} pantalla - Clave de la pantalla a verificar (ej. 'AGENDA_CITAS')
 * @param {number} nivelRequerido - Nivel mínimo requerido (1=Lectura, 2=Edición, 3=Total)
 * @returns {Function} Middleware de Express
 */
const checkPermission = (pool, pantalla, nivelRequerido) => async (req, res, next) => {
  try {
    const { cod_rol } = req.usuario; // viene del authMiddleware

    const [[acceso]] = await pool.execute(
      `SELECT rp.nivel
       FROM roles_pantallas rp
       WHERE rp.cod_rol = ? AND rp.cod_pantalla = ?`,
      [cod_rol, pantalla]
    );

    if (!acceso || acceso.nivel < nivelRequerido) {
      return res.status(403).json({
        message: 'No tienes permiso para realizar esta acción.',
      });
    }

    next();
  } catch (error) {
    console.error('Error en checkPermission:', error);
    return res.status(500).json({ message: 'Error del servidor. Intente más tarde.' });
  }
};

module.exports = checkPermission;
```

**Uso en rutas:**

```javascript
// Nivel 1 — solo lectura
router.get('/citas', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 1), ctrl.getCitas(pool));

// Nivel 2 — puede editar
router.put('/citas/:uuid', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 2), ctrl.actualizarCita(pool));

// Nivel 3 — acceso total (crear y eliminar)
router.post('/citas', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 3), ctrl.crearCita(pool));
router.delete('/citas/:uuid', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 3), ctrl.eliminarCita(pool));
```

---

### 7.3 Middlewares adicionales

Se crean solo cuando hay una necesidad real y repetida que no pertenece a un Controller específico. Ejemplos válidos: validación de formato de archivos subidos, rate limiting por ruta, logging de auditoría.

> ⛔ No crear middlewares para casos de uso de un solo endpoint — eso va en el Controller o el Service.

---

## 8. Convenciones de nombrado

### Carpetas y archivos

| Elemento | Formato | Ejemplo |
|----------|---------|---------|
| Carpeta de dominio | Plural, minúscula | `usuarios`, `productos`, `pedidos` |
| Controller | `{dominio}Controller.js` | `usuariosController.js` |
| Service | `{dominio}Service.js` | `usuariosService.js` |
| Model | `{dominio}Model.js` | `usuariosModel.js` |
| Shared | Descripción de lo que combina | `usuarioConRol.js` |
| Helper | Describe la utilidad | `emailHelper.js`, `uuidHelper.js` |
| Middleware | Describe lo que intercepta | `authMiddleware.js`, `checkPermission.js` |

### Funciones

| Capa | Patrón de nombre | Ejemplo |
|------|-----------------|---------|
| Model | Describe la acción exacta en BD | `buscarXPorY`, `crearX`, `actualizarX`, `eliminarX` |
| Service | Describe la operación de negocio | `loginUsuario`, `registrarProducto`, `cancelarPedido` |
| Controller | Igual que la acción de la ruta | `login`, `registro`, `getPerfil`, `actualizar` |
| Helper | Describe la utilidad que provee | `enviarCorreo`, `generarUUID`, `formatearFecha` |

### Soft delete en Models

```javascript
// Eliminar — nunca DELETE
const eliminarUsuario = async (pool, codUsuario) => {
  await pool.execute(
    `UPDATE usuarios SET fecha_eliminado = NOW() WHERE cod_usuario = ?`,
    [codUsuario]
  );
};

// Consultar activos — siempre filtrar
WHERE fecha_eliminado IS NULL
```

---

## 9. Manejo de errores

### En el Service — lanzar errores de negocio

```javascript
const error = new Error('Mensaje claro para el usuario');
error.statusCode = 404; // 400, 401, 403, 404, 409, etc.
throw error;
```

### En el Controller — capturar y responder

```javascript
} catch (error) {
  console.error('Descripción del contexto del error:', error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Error del servidor. Intente más tarde.' });
}
```

**Códigos de estado:**

| Código | Cuándo usarlo |
|--------|--------------|
| `400` | Datos inválidos o faltantes en la petición |
| `401` | Sin token o token inválido |
| `403` | Token válido pero sin permiso para esta acción |
| `404` | Recurso no encontrado |
| `409` | Conflicto — el recurso ya existe (ej. email duplicado) |
| `500` | Error inesperado del servidor |

> ⛔ Nunca exponer el stack trace en la respuesta al cliente. Solo en los logs del servidor.

---

## 10. Rutas

```javascript
// routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../models/usuarios/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

// Rutas públicas — sin autenticación
router.post('/login',    ctrl.login(pool));
router.post('/registro', ctrl.registro(pool));

// Rutas protegidas — authMiddleware siempre primero, checkPermission segundo
router.get('/',          authMiddleware, checkPermission(pool, 'GESTION_USUARIOS', 1), ctrl.listar(pool));
router.get('/:uuid',     authMiddleware, checkPermission(pool, 'GESTION_USUARIOS', 1), ctrl.getPerfil(pool));
router.put('/:uuid',     authMiddleware, checkPermission(pool, 'GESTION_USUARIOS', 2), ctrl.actualizar(pool));
router.post('/',         authMiddleware, checkPermission(pool, 'GESTION_USUARIOS', 3), ctrl.crear(pool));
router.delete('/:uuid',  authMiddleware, checkPermission(pool, 'GESTION_USUARIOS', 3), ctrl.eliminar(pool));

module.exports = router;
```

**Reglas:**
- Rutas públicas (login, registro) sin ningún middleware
- Rutas protegidas: `authMiddleware` siempre primero, `checkPermission` siempre segundo
- `checkPermission` recibe la clave de pantalla en mayúsculas y el nivel mínimo requerido
- URLs usan `uuid_` — nunca el `cod_` interno: `/usuarios/:uuid_usuario`
- GET → nivel 1, PUT/PATCH → nivel 2, POST/DELETE → nivel 3

---

## 11. Checklist antes de entregar código

```
CONTROLLER
 [ ] Valida todos los campos requeridos antes de llamar al Service
 [ ] Llama a exactamente una función del Service
 [ ] Tiene try/catch con manejo de statusCode y fallback 500
 [ ] No contiene lógica de negocio ni queries SQL
 [ ] No llama a Models ni a Helpers directamente

SERVICE
 [ ] Toda decisión de negocio está aquí
 [ ] Los errores se lanzan con error.statusCode explícito
 [ ] No construye queries SQL directamente
 [ ] Usa helpers para tareas utilitarias (email, UUID, etc.)

MODEL
 [ ] Toda función tiene comentario JSDoc completo
 [ ] Usa consultas preparadas con ? (sin concatenación SQL)
 [ ] El primer parámetro siempre es pool
 [ ] No lanza errores de negocio con statusCode
 [ ] Las consultas de activos filtran por fecha_eliminado IS NULL

HELPERS
 [ ] Cada helper tiene una sola responsabilidad clara
 [ ] Las funciones están documentadas con JSDoc
 [ ] No contienen lógica de negocio ni queries SQL

MIDDLEWARES
 [ ] authMiddleware y checkPermission están presentes desde el inicio
 [ ] checkPermission siempre recibe pantalla en mayúsculas y nivel numérico
 [ ] No se crearon middlewares para casos de uso de un solo endpoint

SHARED
 [ ] Antes de escribir un query nuevo, se revisó si ya existe en shared/
 [ ] Las funciones en shared/ tienen JSDoc

RUTAS
 [ ] Rutas públicas sin middlewares
 [ ] Rutas protegidas con authMiddleware + checkPermission en ese orden
 [ ] GET usa nivel 1, PUT usa nivel 2, POST/DELETE usan nivel 3
 [ ] URLs usan uuid_, nunca cod_ internos

GENERAL
 [ ] Sin console.log de debug olvidados
 [ ] Variables de entorno con process.env.NOMBRE, no hardcodeadas
 [ ] Soft delete con fecha_eliminado, sin DELETE directos
```

---

*Web-innova Studio · Panamá · 2026*
