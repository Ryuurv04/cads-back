# Estándar de Seguridad de Aplicaciones Web

**Documento de Referencia Técnica y Buenas Prácticas**

*Versión:* 1.0  
*Última Actualización:* Julio 2026  
*Ámbito de Aplicación:* Frontend (Next.js/React), Backend (Node.js/Express), Base de Datos (MySQL) e Infraestructura Local.  
*Marco Legal:* Cumplimiento de la **Ley 81 de Protección de Datos Personales (Panamá)**.

---

## 1. Control de Accesos, Autenticación y Gestión de Sesiones

### 1.1 Robustez de Contraseñas y Almacenamiento

* **Hashing Obligatorio:** Queda estrictamente prohibido el almacenamiento de contraseñas en texto plano o utilizando algoritmos obsoletos (MD5, SHA1). Se debe implementar **`bcrypt`** con un factor de costo mínimo de `12` o **`argon2id`**.
* **Validación en Registro:** Se debe exigir una longitud mínima de 10 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.

### 1.2 Gestión de Sesiones (Tokens JWT)

* **Almacenamiento Seguro:** Los tokens JWT **no deben almacenarse en `localStorage` ni en `sessionStorage`** debido al riesgo de filtración por ataques XSS (Cross-Site Scripting).
* **Uso de Cookies:** El JWT se debe enviar desde el servidor utilizando cookies con las siguientes directivas obligatorias:
  * `HttpOnly`: Impide el acceso al token mediante scripts de JavaScript.
  * `Secure`: Restringe la transmisión de la cookie exclusivamente a conexiones HTTPS.
  * `SameSite=Strict` o `SameSite=Lax`: Protege la sesión contra ataques CSRF (Cross-Site Request Forgery).
* **Expiración:** Los tokens de acceso deben tener un tiempo de vida corto (máximo 15-30 minutos). Se debe evaluar el uso de *Refresh Tokens* rotativos para sesiones prolongadas.

### 1.3 Control de Flujo y Mitigación de Abuso (Rate Limiting)

* Se debe configurar el middleware `express-rate-limit` en el backend para mitigar ataques de fuerza bruta y *credential stuffing*.
* **Umbral Crítico:** Las rutas de `/api/auth/login` y `/api/auth/register` deben limitarse a un máximo de 5 a 10 intentos por minuto por dirección IP antes de bloquear temporalmente las solicitudes.

---

## 2. Seguridad en el Desarrollo de Software (Código Seguro)

### 2.1 Validación y Saneamiento de Entradas (Input Validation)

* **Validación Estricta:** Todas las solicitudes entrantes al backend (API REST) deben ser validadas en su estructura, tipo de datos y longitud antes de procesarse. Se utilizarán esquemas de validación mediante **`zod`** o **`joi`**.
* **Política de Rechazo:** Si un parámetro no cumple exactamente con el esquema esperado (ej. un campo numérico que recibe caracteres alfabéticos), la petición debe ser rechazada de inmediato con un código de estado `HTTP 400 Bad Request`.

### 2.2 Prevención de Inyecciones SQL (SQLi)

* **Consultas Preparadas:** Queda terminantemente prohibida la concatenación directa de variables dentro de cadenas de texto de consultas SQL (ej. `SELECT * FROM ... WHERE id = ' + id`).
* **Estándar:** Todas las interacciones con MySQL deben realizarse mediante **Consultas Preparadas (Prepared Statements)** utilizando marcadores de posición (`?`) provistos por el driver nativo de MySQL (`mysql2`) o mediante la abstracción segura de un ORM/Query Builder debidamente configurado (ej. Sequelize, Prisma).

### 2.3 Cabeceras de Seguridad HTTP

* El backend de Express debe implementar el middleware **`helmet`** para inyectar automáticamente cabeceras de protección esenciales:

```javascript
const helmet = require('helmet');
app.use(helmet());
```

* Se debe configurar una directiva básica de Content Security Policy (CSP) para mitigar la ejecución de scripts no autorizados en el frontend.

---

## 3. Gestión de Vulnerabilidades y Dependencias

### 3.1 Auditoría de Código y Librerías de Terceros

* Dado que el ecosistema de Node.js es propenso a ataques en la cadena de suministro (*supply chain attacks*), se establece el siguiente control semanal obligatorio:
  * Ejecución de `npm audit` o `yarn audit` en el entorno de desarrollo.
  * Todo despliegue a producción queda condicionado a que no existan alertas de vulnerabilidades catalogadas como `Critical` o `High`.
* Se recomienda la integración automatizada en el repositorio de herramientas como **Snyk** o **Dependabot** para el monitoreo pasivo de librerías vulnerables.

---

## 4. Seguridad de la Infraestructura (Servidor Propio)

### 4.1 Ocultamiento de Huella Digital (Hardening)

* Se deben deshabilitar las firmas de versión en el servidor web que actúe como proxy inverso (ej. Nginx o Apache). La cabecera `Server` no debe exponer la versión de software instalada (ej. configurar `server_tokens off;` en Nginx).
* En el backend de Express, se debe deshabilitar la cabecera por defecto:

```javascript
app.disable('x-powered-by');
```

### 4.2 Defensa Perimetral y Capa de Aplicación

* **Firewall de Red:** Mantener cerrado cualquier puerto del servidor que no sea estrictamente necesario para el funcionamiento del servicio (únicamente puertos `80` y `443` expuestos al exterior).
* **Cortafuegos de Aplicación Web (WAF):** Se establece como objetivo prioritario de infraestructura colocar un proxy intermedio en la nube (ej. **Cloudflare**) delante del firewall perimetral local. Esto proporciona:
  * Mitigación de ataques DDoS distribuidos.
  * Bloqueo automatizado de escaneos de vulnerabilidades antes de que la petición impacte el servidor propio.
  * Cifrado SSL/TLS gestionado de extremo a extremo.

---

## 5. Cumplimiento de la Ley 81 (Protección de Datos — Panamá)

### 5.1 Principio de Seguridad y Confidencialidad

* **Protección del Dato Comercial:** Los datos relativos a comerciantes, patrones de medición y calibraciones son considerados información crítica de negocio. Su alteración o filtración vulnera la confidencialidad exigida por la ley.
* **Trazabilidad (Logs de Auditoría):** Se debe implementar un sistema de registro de eventos (*logging*) no destructivo que almacene de forma segura qué usuario accedió o modificó un dato sensible. Los logs de auditoría **no deben almacenar credenciales ni tokens de sesión** bajo ninguna circunstancia.

### 5.2 Principios Generales de Tratamiento de Datos

* **Minimización:** Solo se recopilan los datos estrictamente necesarios para la finalidad declarada.
* **Finalidad explícita:** El uso de cada dato debe estar justificado. No se reutilizan datos para propósitos distintos al original sin consentimiento.
* **Consentimiento:** El usuario debe otorgar consentimiento informado antes de que sus datos sean recopilados o procesados.

### 5.3 Derecho al Olvido y Eliminación

* El sistema debe implementar **soft delete** (`deleted_at`) en todas las tablas que contengan datos personales.
* Se debe proveer un mecanismo para que el usuario pueda solicitar la eliminación definitiva de sus datos dentro del plazo establecido por la Ley 81.

---

## 6. Checklist de Seguridad — Verificación Previa a Producción

Antes de hacer deploy, verificar cada punto sin excepción:

```
AUTENTICACIÓN Y SESIONES
 [ ] Contraseñas hasheadas con bcrypt (costo >= 12)
 [ ] JWT en cookies HttpOnly + Secure + SameSite
 [ ] Expiración del token configurada (máx. 30 min)
 [ ] Rate limiting en rutas de auth (máx. 10 intentos/min)

CÓDIGO SEGURO
 [ ] Validación de entradas con zod o joi en todos los endpoints
 [ ] Consultas preparadas en todos los queries (sin concatenación SQL)
 [ ] helmet configurado en Express
 [ ] x-powered-by deshabilitado
 [ ] CORS restringido al dominio del frontend (sin wildcard *)
 [ ] CSP básica configurada

DEPENDENCIAS
 [ ] npm audit sin vulnerabilidades Critical ni High
 [ ] Dependencias actualizadas

INFRAESTRUCTURA
 [ ] HTTPS activo con certificado válido
 [ ] Puertos innecesarios cerrados (solo 80 y 443)
 [ ] Variables de entorno en el servidor (.env fuera del repo)
 [ ] Logs sin datos personales ni tokens
 [ ] Cloudflare o WAF equivalente activo (si aplica)

PROTECCIÓN DE DATOS (LEY 81)
 [ ] Solo se recopilan datos necesarios para la finalidad
 [ ] Soft delete implementado en tablas con datos personales
 [ ] Consentimiento documentado si aplica
 [ ] Logs de auditoría sin credenciales ni tokens
```

---

*Web-innova Studio · Panamá · 2026*
