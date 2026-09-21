# Estándar Universal de Estructura y Diseño de Base de Datos

**Guía Maestra de Arquitectura, Rendimiento y Seguridad en Datos**

*Versión:* 1.3  
*Última Actualización:* Julio 2026  
*Motor de Referencia:* MySQL 8.x+ / Relacionales  
*Ámbito:* Todos los proyectos de Web-innova Studio

---

## Índice

1. [Estrategia de Identificadores](#1-estrategia-de-identificadores)
2. [Convenciones de Nombres](#2-convenciones-de-nombres)
3. [Comentarios Obligatorios en SQL](#3-comentarios-obligatorios-en-sql)
4. [Tipos de Datos Críticos](#4-tipos-de-datos-críticos)
5. [Ciclo de Vida de los Registros](#5-ciclo-de-vida-de-los-registros)
6. [Plantilla Base de Tabla](#6-plantilla-base-de-tabla)
7. [Checklist Previa a Producción](#7-checklist-previa-a-producción)

---

## 1. Estrategia de Identificadores

Para garantizar seguridad contra ataques de enumeración masiva, minería de datos e IDOR (Insecure Direct Object Reference), se establece el uso obligatorio de la siguiente convención de identificadores. **Queda estrictamente prohibido el uso del término genérico `id`.**

### 1.1 Llave Primaria Interna — Código de Rendimiento

| Propiedad | Valor |
|-----------|-------|
| Formato | `cod_` + nombre de tabla en singular |
| Ejemplo | Tabla `usuarios` → `cod_usuario` |
| Tipo de dato | `BIGINT UNSIGNED AUTO_INCREMENT` |
| Propósito | Indexación física, rendimiento en disco y JOINs internos |

> ⛔ **Regla crítica:** Este código es de uso **exclusivo interno**. Nunca debe exponerse en la API pública, respuestas JSON, URLs ni formularios del frontend.

---

### 1.2 Llave Pública Única — Código de Intercambio

| Propiedad | Valor |
|-----------|-------|
| Formato | `uuid_` + nombre de tabla en singular |
| Ejemplo | Tabla `usuarios` → `uuid_usuario` |
| Tipo de dato | `VARCHAR(36)` o `BINARY(16)` |
| Generación | UUID v4, automático al insertar el registro |
| Propósito | Identificador externo — viaja a la API y al frontend |

> ✅ **Regla:** Este es el **único identificador** que se expone al exterior. Oculta por completo el orden y la cantidad real de registros en la base de datos.

---

## 2. Convenciones de Nombres

### 2.1 Tablas y Columnas

| Elemento | Regla | Ejemplo |
|----------|-------|---------|
| Tablas | Plural, minúsculas, snake_case | `usuarios`, `productos`, `transferencias_saldos` |
| Columnas | Minúsculas, descriptivas, snake_case | `correo_electronico`, `nombre_completo` |
| Booleanos | Prefijo `is_` o `has_` | `is_activo`, `has_permiso` |

---

### 2.2 Llaves Foráneas — Regla de Conexión

**Caso 1 — Conexión estándar (nombre idéntico a la PK del padre)**

Toda llave foránea debe llamarse **exactamente igual** que la llave primaria de la tabla a la que apunta.

```sql
-- La tabla pedidos apunta a usuarios mediante cod_usuario
cod_usuario BIGINT UNSIGNED NOT NULL
  COMMENT 'FK estándar → tabla [usuarios](cod_usuario)'
```

---

**Caso 2 — Conexión especial (nombre diferente por lógica de negocio)**

Cuando una tabla referencia dos veces a la misma tabla padre (o cuando el nombre semántico debe ser diferente), el comentario debe declarar obligatoriamente:

1. La tabla padre exacta a la que apunta
2. La columna exacta que referencia
3. El propósito específico de esa columna en la relación

```sql
cod_usuario_origen BIGINT UNSIGNED NOT NULL
  COMMENT 'FK ESPECIAL → tabla [usuarios](cod_usuario). PROPÓSITO: Usuario que envía los fondos y del cual se debita el saldo.',

cod_usuario_destino BIGINT UNSIGNED NOT NULL
  COMMENT 'FK ESPECIAL → tabla [usuarios](cod_usuario). PROPÓSITO: Usuario que recibe los fondos y al cual se acredita el saldo.'
```

---

## 3. Comentarios Obligatorios en SQL

Todo script `CREATE TABLE` o `ALTER TABLE` debe estar documentado nativamente con `COMMENT` para que cualquier desarrollador nuevo entienda el sistema sin documentación externa.

| Tipo de columna | Qué debe documentar el comentario |
|-----------------|-----------------------------------|
| PK interna (`cod_`) | Que es llave primaria interna y su propósito |
| UUID público (`uuid_`) | Que es el identificador externo para API y frontend |
| Columna estándar | Qué dato almacena, propósito y formato si aplica |
| FK estándar | Nombre de la tabla destino y columna a la que apunta |
| FK especial | Tabla origen, columna exacta y propósito de negocio detallado |
| Soft delete | Que es control de borrado lógico |

---

## 4. Tipos de Datos Críticos

### 4.1 Valores Numéricos Exactos

> ⛔ **Prohibido:** `FLOAT` y `DOUBLE` para dinero, porcentajes, tasas, puntuaciones o magnitudes exactas — generan errores de redondeo del procesador.

> ✅ **Obligatorio:** `DECIMAL(M, D)` para cualquier valor que requiera precisión exacta.

```sql
monto          DECIMAL(12, 4)  -- dinero con 4 decimales
porcentaje     DECIMAL(5, 2)   -- 0.00 a 999.99
precio         DECIMAL(10, 2)  -- precio estándar de producto
```

---

### 4.2 Booleanos y Estados

```sql
is_activo      BOOLEAN DEFAULT TRUE   COMMENT 'Estado activo del registro'
has_permiso    BOOLEAN DEFAULT FALSE  COMMENT 'Indica si el usuario tiene permiso especial'
```

---

### 4.3 Fechas de Control Obligatorias

Toda tabla debe incluir estas dos columnas de control de ciclo de vida:

```sql
fecha_creado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP  COMMENT 'Fecha de creación del registro'
fecha_eliminado TIMESTAMP NULL DEFAULT NULL          COMMENT 'Control de borrado lógico — NULL = activo'
```

---

## 5. Ciclo de Vida de los Registros

### 5.1 Borrado Lógico — Soft Delete

No todas las tablas necesitan `fecha_eliminado`. Depende del tipo de tabla y del rol que cumple en el sistema.

---

**Tablas que SÍ requieren `fecha_eliminado`**

Son las tablas de entidades operativas — cosas que el negocio crea, usa y eventualmente "elimina" pero que necesitan conservarse por trazabilidad, historial o integridad referencial.

| Señal | Ejemplo |
|-------|---------|
| Tiene relaciones con otras tablas | `usuarios` → referenciado en citas, pedidos, logs |
| Forma parte del historial del negocio | `citas`, `pedidos`, `documentos` |
| El usuario final puede "eliminar" el registro | `clientes`, `productos`, `mascotas` |
| Borrarlo físicamente rompe el historial | Cualquier tabla con FK activa desde otra |

```sql
-- Columnas obligatorias en tablas operativas
fecha_creado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP  COMMENT 'Fecha de creación del registro'
fecha_eliminado TIMESTAMP NULL DEFAULT NULL          COMMENT 'Control de borrado lógico — NULL = activo'

-- Eliminar lógicamente — nunca DELETE
UPDATE usuarios SET fecha_eliminado = NOW() WHERE cod_usuario = ?;

-- Consultar solo activos — siempre filtrar
SELECT * FROM usuarios WHERE fecha_eliminado IS NULL;
```

---

**Tablas que NO requieren `fecha_eliminado`**

Son tablas de catálogo, configuración o estructura. El concepto de "eliminar" no aplica en su flujo normal — se actualizan, se reemplazan o se desactivan.

| Tipo de tabla | Mecanismo correcto | Ejemplo |
|---------------|-------------------|---------|
| Catálogo fijo definido por el sistema | Sin nada — solo se agrega o modifica | `pantallas`, `sectores`, `tipos_sujeto` |
| Configuración con valor variable | Sin nada — se actualiza el valor | `configuraciones`, `parametros` |
| Tabla que puede desactivarse | `is_activo BOOLEAN` | `planes`, `servicios`, `sedes` |
| Tabla pivote pura (muchos a muchos) | `DELETE` directo — su propósito es existir o no | `roles_pantallas`, `usuarios_roles` |

```sql
-- Tablas que se desactivan (no se borran)
is_activo BOOLEAN DEFAULT TRUE COMMENT 'FALSE = desactivado, no aparece en el flujo público'

-- Tabla pivote — aquí sí se permite DELETE directo
-- Ejemplo: quitar acceso de un rol a una pantalla
DELETE FROM roles_pantallas WHERE cod_rol = ? AND cod_pantalla = ?;
```

---

**Resumen de decisión rápida**

```
¿El registro tiene FKs desde otras tablas?       → fecha_eliminado
¿El usuario final puede "borrarlo" desde la UI?  → fecha_eliminado
¿Es historial o trazabilidad?                    → fecha_eliminado

¿Es catálogo que tú defines en el deploy?        → sin fecha_eliminado
¿Es configuración que solo se actualiza?         → sin fecha_eliminado
¿Necesita desactivarse sin borrarse?             → is_activo
¿Es tabla pivote pura (muchos a muchos)?         → DELETE directo permitido
```

> ⛔ **Nunca** usar `DELETE` en tablas operativas con relaciones activas — rompe el historial e integridad referencial.

---

### 5.2 Configuración de Motor Obligatoria

Toda tabla debe declarar explícitamente el motor y el charset:

```sql
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
```

`utf8mb4` es obligatorio para soporte completo de caracteres especiales, acentos y emojis. `InnoDB` es requerido para soporte de transacciones y llaves foráneas.

---

## 6. Plantilla Base de Tabla

Copiar esta plantilla al crear cualquier tabla nueva. Ajustar el nombre, las columnas propias del dominio y los comentarios.

> ✅ **Antes de copiar:** determinar si la tabla es operativa (con `fecha_eliminado`), de catálogo (sin ella) o pivote (con `DELETE` directo permitido). Ver sección 5.1.

```sql
-- =============================================================================
-- TABLA: [nombre_tabla]
-- TIPO: [Operativa / Catálogo / Pivote]
-- DESCRIPCIÓN: [Qué representa esta tabla en el sistema]
-- CREADO: [Fecha]
-- =============================================================================
CREATE TABLE nombre_tabla (

    -- IDENTIFICADORES
    -- Omitir en tablas pivote y en tablas de catálogo con clave semántica propia
    cod_nombre     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                   COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_nombre    VARCHAR(36) UNIQUE NOT NULL
                   COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    -- COLUMNAS PROPIAS DEL DOMINIO
    -- [agregar aquí las columnas específicas de esta tabla]

    -- LLAVES FORÁNEAS ESTÁNDAR
    -- cod_[padre]  BIGINT UNSIGNED NOT NULL
    --              COMMENT 'FK estándar → tabla [[padre]](cod_[padre])'

    -- LLAVES FORÁNEAS ESPECIALES (si aplica)
    -- cod_[alias]  BIGINT UNSIGNED NOT NULL
    --              COMMENT 'FK ESPECIAL → tabla [[padre]](cod_[padre]). PROPÓSITO: [descripción]'

    -- CONTROL DE CICLO DE VIDA
    -- Solo en tablas operativas — omitir en catálogos y pivotes
    fecha_creado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    COMMENT 'Fecha de creación del registro',

    fecha_eliminado TIMESTAMP NULL DEFAULT NULL
                    COMMENT 'Control de borrado lógico — NULL = activo. Solo en tablas operativas.',

    -- RESTRICCIONES DE INTEGRIDAD REFERENCIAL
    -- FOREIGN KEY (cod_[padre]) REFERENCES [padre](cod_[padre]) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.1 Ejemplo — Tabla operativa (con fecha_eliminado)

```sql
-- =============================================================================
-- TABLA: clientes
-- TIPO: Operativa
-- DESCRIPCIÓN: Personas registradas como clientes del negocio
-- =============================================================================
CREATE TABLE clientes (

    cod_cliente     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                    COMMENT 'Llave primaria interna del cliente',

    uuid_cliente    VARCHAR(36) UNIQUE NOT NULL
                    COMMENT 'UUID público del cliente para uso en la API',

    nombre          VARCHAR(100) NOT NULL
                    COMMENT 'Nombre del cliente',

    email           VARCHAR(150) UNIQUE NOT NULL
                    COMMENT 'Correo electrónico, debe ser único en el sistema',

    fecha_creado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    COMMENT 'Fecha de registro del cliente',

    fecha_eliminado TIMESTAMP NULL DEFAULT NULL
                    COMMENT 'Control de borrado lógico — NULL = activo'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.2 Ejemplo — Tabla de catálogo (sin fecha_eliminado)

```sql
-- =============================================================================
-- TABLA: sectores
-- TIPO: Catálogo
-- DESCRIPCIÓN: Sectores de negocio disponibles en la plataforma.
--              Definidos por el sistema, no por el usuario.
-- =============================================================================
CREATE TABLE sectores (

    cod_sector  VARCHAR(30) NOT NULL
                COMMENT 'Clave semántica del sector (ej. VETERINARIA, BARBERIA)',

    nombre      VARCHAR(100) NOT NULL
                COMMENT 'Nombre legible del sector para mostrar en la UI',

    is_activo   BOOLEAN DEFAULT TRUE
                COMMENT 'FALSE = sector desactivado, no aparece en el onboarding',

    PRIMARY KEY (cod_sector)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.3 Ejemplo — Tabla pivote pura (DELETE directo permitido)

```sql
-- =============================================================================
-- TABLA: roles_pantallas
-- TIPO: Pivote
-- DESCRIPCIÓN: Matriz de accesos — define el nivel de cada rol en cada pantalla.
--              Al modificar permisos se actualiza el nivel o se elimina la fila.
--              DELETE directo permitido en esta tabla.
-- =============================================================================
CREATE TABLE roles_pantallas (

    cod_rol      VARCHAR(36) NOT NULL
                 COMMENT 'FK estándar → tabla [roles](cod_rol)',

    cod_pantalla VARCHAR(50) NOT NULL
                 COMMENT 'FK estándar → tabla [pantallas](cod_pantalla)',

    nivel        TINYINT NOT NULL DEFAULT 0
                 COMMENT 'Nivel de acceso: 0=Sin acceso, 1=Lectura, 2=Edición, 3=Total',

    PRIMARY KEY (cod_rol, cod_pantalla),

    CONSTRAINT chk_nivel_acceso CHECK (nivel BETWEEN 0 AND 3),

    FOREIGN KEY (cod_rol)      REFERENCES roles(cod_rol)          ON DELETE CASCADE,
    FOREIGN KEY (cod_pantalla) REFERENCES pantallas(cod_pantalla) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.4 Ejemplo — Tabla con ambos tipos de FK (operativa compleja)

```sql
-- =============================================================================
-- TABLA: transferencias_saldos
-- TIPO: Operativa
-- DESCRIPCIÓN: Registra cada movimiento de fondos entre usuarios del sistema
-- =============================================================================
CREATE TABLE transferencias_saldos (

    cod_transferencia  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                       COMMENT 'Llave primaria interna de la transferencia',

    uuid_transferencia VARCHAR(36) UNIQUE NOT NULL
                       COMMENT 'UUID público de la transferencia para uso en la API',

    cod_usuario        BIGINT UNSIGNED NOT NULL
                       COMMENT 'FK estándar → tabla [usuarios](cod_usuario) — auditor del registro',

    cod_usuario_origen  BIGINT UNSIGNED NOT NULL
                        COMMENT 'FK ESPECIAL → tabla [usuarios](cod_usuario). PROPÓSITO: Usuario que envía los fondos, del cual se debita el saldo.',

    cod_usuario_destino BIGINT UNSIGNED NOT NULL
                        COMMENT 'FK ESPECIAL → tabla [usuarios](cod_usuario). PROPÓSITO: Usuario que recibe los fondos, al cual se acredita el saldo.',

    monto_transferido   DECIMAL(12, 4) NOT NULL
                        COMMENT 'Monto exacto — DECIMAL para evitar errores de redondeo',

    fecha_creado        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        COMMENT 'Fecha de ejecución del registro',

    fecha_eliminado     TIMESTAMP NULL DEFAULT NULL
                        COMMENT 'Control de borrado lógico',

    FOREIGN KEY (cod_usuario)         REFERENCES usuarios(cod_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (cod_usuario_origen)  REFERENCES usuarios(cod_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (cod_usuario_destino) REFERENCES usuarios(cod_usuario) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. Sistema de Permisos por Pantalla y Nivel

Todo proyecto que tenga roles de usuario debe implementar este modelo de permisos. Define qué puede hacer cada rol en cada pantalla del sistema, con niveles graduales de acceso.

### 7.1 Modelo de niveles de acceso

| Nivel | Nombre | Qué permite |
|-------|--------|-------------|
| `0` | Sin acceso | No puede ver ni hacer nada en esta pantalla |
| `1` | Lectura | Solo puede consultar y ver datos |
| `2` | Edición | Puede consultar y modificar datos existentes |
| `3` | Total | Puede consultar, crear, editar y eliminar |

---

### 7.2 Tablas requeridas

```sql
-- =============================================================================
-- TABLA: pantallas
-- DESCRIPCIÓN: Catálogo de todas las pantallas/módulos del sistema.
--              Cada pantalla tiene una clave semántica legible que se usa
--              directamente en el código del backend para los checks de permiso.
-- =============================================================================
CREATE TABLE pantallas (

    cod_pantalla           VARCHAR(50) NOT NULL
                           COMMENT 'Clave semántica en mayúsculas que identifica la pantalla (ej. AGENDA_CITAS). Se usa directamente en el middleware checkPermission.',

    descripcion            VARCHAR(150) NOT NULL
                           COMMENT 'Descripción legible de qué módulo o sección representa esta pantalla',

    es_pantalla_plataforma BOOLEAN DEFAULT FALSE
                           COMMENT 'TRUE = pantalla exclusiva del SuperAdmin de la plataforma. Nunca aparece en la matriz de roles de los negocios registrados.',

    PRIMARY KEY (cod_pantalla)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: roles_pantallas
-- DESCRIPCIÓN: Matriz de accesos que define qué nivel tiene cada rol
--              en cada pantalla del sistema.
--              0=Sin acceso | 1=Lectura | 2=Edición | 3=Total
-- =============================================================================
CREATE TABLE roles_pantallas (

    cod_rol      VARCHAR(36) NOT NULL
                 COMMENT 'FK estándar → tabla [roles](cod_rol)',

    cod_pantalla VARCHAR(50) NOT NULL
                 COMMENT 'FK estándar → tabla [pantallas](cod_pantalla)',

    nivel        TINYINT NOT NULL DEFAULT 0
                 COMMENT 'Nivel de acceso: 0=Sin acceso, 1=Lectura, 2=Edición, 3=Total',

    PRIMARY KEY (cod_rol, cod_pantalla),

    CONSTRAINT chk_nivel_acceso CHECK (nivel BETWEEN 0 AND 3),

    FOREIGN KEY (cod_rol)      REFERENCES roles(cod_rol)           ON DELETE CASCADE,
    FOREIGN KEY (cod_pantalla) REFERENCES pantallas(cod_pantalla)  ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7.3 Excepción al estándar de identificadores

La tabla `pantallas` usa `cod_pantalla VARCHAR(50)` como PK directa en vez del patrón estándar `BIGINT + UUID`. Esto es intencional y está justificado porque:

- `cod_pantalla` es una **clave semántica legible** que tú defines manualmente (`'AGENDA_CITAS'`, `'GESTION_USUARIOS'`)
- Se usa directamente en el código del backend, lo que hace el código legible sin consultar la BD
- `pantallas` es una **tabla de catálogo** — sus registros se insertan en el deploy inicial y no cambian en tiempo de ejecución
- No es una entidad operativa que el usuario crea o consulta desde el frontend

```javascript
// Con clave semántica — el código se explica solo
checkPermission(pool, 'AGENDA_CITAS', 1)

// Con BIGINT autoincremental — no dice nada
checkPermission(pool, 47, 1)
```

---

### 7.4 Datos iniciales — INSERT de pantallas

Las pantallas se insertan con `INSERT IGNORE` en el script de inicialización del proyecto para que no fallen si ya existen.

```sql
-- Pantallas operativas del sistema (es_pantalla_plataforma = FALSE)
-- Son las que aparecen en la matriz de roles de cada negocio
INSERT IGNORE INTO pantallas (cod_pantalla, descripcion, es_pantalla_plataforma) VALUES
    ('AGENDA_CITAS',     'Calendario y gestión de citas del negocio',            FALSE),
    ('GESTION_CLIENTES', 'Registro y consulta de clientes',                       FALSE),
    ('GESTION_USUARIOS', 'Administración del personal y sus accesos',             FALSE),
    ('CONFIG_NEGOCIO',   'Configuración general del negocio',                     FALSE);

-- Pantallas exclusivas del SuperAdmin de la plataforma (es_pantalla_plataforma = TRUE)
-- Nunca aparecen en la configuración de roles de los negocios registrados
INSERT IGNORE INTO pantallas (cod_pantalla, descripcion, es_pantalla_plataforma) VALUES
    ('GESTION_NEGOCIOS', 'Vista global de todos los negocios registrados',        TRUE),
    ('GESTION_PLANES',   'Administración de planes y suscripciones',              TRUE);
```

---

### 7.5 Cómo se usa en el backend

El middleware `checkPermission` consulta `roles_pantallas` en tiempo de ejecución con la clave de pantalla y verifica que el nivel del rol sea mayor o igual al nivel requerido.

```javascript
// GET — requiere nivel 1 (lectura)
router.get('/citas', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 1), ctrl.listar(pool));

// PUT — requiere nivel 2 (edición)
router.put('/citas/:uuid', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 2), ctrl.actualizar(pool));

// POST y DELETE — requieren nivel 3 (total)
router.post('/citas',        authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 3), ctrl.crear(pool));
router.delete('/citas/:uuid', authMiddleware, checkPermission(pool, 'AGENDA_CITAS', 3), ctrl.eliminar(pool));
```

---

## 8. Checklist Previa a Producción

Verificar cada punto antes de ejecutar cualquier script de base de datos en producción:

```
IDENTIFICADORES
 [ ] Tablas operativas tienen cod_ (BIGINT UNSIGNED AUTO_INCREMENT) y uuid_ (VARCHAR(36) UNIQUE)
 [ ] Tablas de catálogo con clave semántica tienen su excepción documentada
 [ ] Tablas pivote no tienen cod_ ni uuid_ — solo las columnas de la relación
 [ ] Ningún campo se llama genéricamente "id"
 [ ] El cod_ nunca aparece en respuestas de la API

NOMBRES Y CONEXIONES
 [ ] Nombres de tablas en plural y snake_case
 [ ] Columnas en minúsculas y snake_case
 [ ] Booleanos con prefijo is_ o has_
 [ ] FKs estándar con el mismo nombre que la PK del padre
 [ ] FKs especiales con comentario extendido (tabla, columna, propósito)

TIPOS DE DATOS
 [ ] Sin FLOAT ni DOUBLE para valores numéricos exactos
 [ ] Dinero y porcentajes con DECIMAL(M,D)
 [ ] Booleanos con BOOLEAN o TINYINT(1)

COMENTARIOS SQL
 [ ] Todas las columnas tienen COMMENT
 [ ] El encabezado de cada tabla declara su TIPO (Operativa / Catálogo / Pivote)
 [ ] FKs especiales con comentario extendido completo

CICLO DE VIDA
 [ ] Tablas operativas tienen fecha_creado y fecha_eliminado
 [ ] Tablas de catálogo desactivables tienen is_activo en vez de fecha_eliminado
 [ ] Tablas de catálogo fijas no tienen fecha_eliminado ni is_activo
 [ ] Tablas pivote no tienen fecha_eliminado — DELETE directo está permitido
 [ ] No hay DELETE en tablas operativas con relaciones activas

SISTEMA DE PERMISOS
 [ ] La tabla pantallas existe con cod_pantalla como clave semántica en mayúsculas
 [ ] La tabla roles_pantallas existe con la constraint chk_nivel_acceso (0-3)
 [ ] Las pantallas del sistema están insertadas con INSERT IGNORE en el script inicial
 [ ] Las pantallas exclusivas de SuperAdmin tienen es_pantalla_plataforma = TRUE
 [ ] Cada nueva pantalla tiene su INSERT en el script de inicialización

CONFIGURACIÓN
 [ ] Motor InnoDB declarado explícitamente en toda tabla
 [ ] Charset utf8mb4 con collation utf8mb4_unicode_ci
 [ ] FOREIGN KEY con ON DELETE RESTRICT en tablas operativas
 [ ] FOREIGN KEY con ON DELETE CASCADE en tablas pivote
```

---

*Web-innova Studio · Panamá · 2026*
