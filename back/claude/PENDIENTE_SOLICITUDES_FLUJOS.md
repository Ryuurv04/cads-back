# Diseño Pendiente — Pantallas de Solicitud y Motor de Flujos

**Estado:** Acordado en diseño — NO implementado todavía.
*Última actualización:* Julio 2026
*Ámbito:* Este proyecto (backend derivado de SIGDC, `back/`)

Este documento registra una decisión de arquitectura ya discutida y cerrada,
para retomarla más adelante sin tener que re-derivarla. Complementa a
`ESTANDAR_BASE_DE_DATOS.md` y `ESTANDAR_ARQUITECTURA_BACKEND.md` — no los
reemplaza.

---

## Contexto

El sistema tiene pantallas (`pantallas`, controla acceso/navegación por rol)
y un motor de flujos de aprobación (`flujos`, `flujo_pasos`,
`flujo_instancias`, `flujo_aprobaciones`) enganchado a través de `procesos`
(bisagra entre un evento de negocio y su flujo).

Se evaluó **fusionar `pantallas` y `procesos`** (agregar `cod_flujo`
directo a `pantallas`) para simplificar la configuración desde el admin.
**Se descartó.** Motivo: asume una relación 1 pantalla = 1 flujo que no se
sostiene — una pantalla de gestión puede tener varias acciones con flujos
distintos (o ninguno), y puede existir una pantalla de "bandeja de
aprobaciones" que no tiene flujo propio. Mezclar "qué puedo ver/hacer en
esta pantalla" con "esto dispara una aprobación" repite el mismo error que
ya se evitó al separar `roles_pantallas.nivel` de `permisos` (nivel vs.
permiso especial son conceptos distintos, ver `ESTANDAR_BASE_DE_DATOS.md`
sección 7).

**Decisión final:** `pantallas` y `procesos` se mantienen como tablas
separadas. La simplificación para el admin se resuelve en la capa de
aplicación (un solo formulario visible, dos escrituras por debajo), no en
el esquema.

---

## 1. `pantallas.tipo_pantalla` (pendiente de agregar)

Nueva columna en `pantallas`:

```sql
tipo_pantalla ENUM('vista','gestion','solicitud') NOT NULL DEFAULT 'vista'
              COMMENT 'vista=solo consulta, gestion=CRUD de un catálogo/entidad,
                       solicitud=formulario que puede disparar un flujo de aprobación'
```

Solo sirve para clasificar/agrupar la pantalla en la UI de Configuración y
para que el formulario de admin sepa cuándo mostrar el selector de flujo.
No crea ninguna relación nueva por sí sola.

---

## 2. Configuración desde el admin — un formulario, dos tablas

Pantalla de admin **Configuración > Pantallas**: nombre, `cod_pantalla`,
`tipo_pantalla`. Si `tipo_pantalla = 'solicitud'`, se muestra un selector
de flujo (de los ya creados en **Configuración > Flujos**, que sigue
siendo la pantalla donde se arma `flujos` + `flujo_pasos`).

Al guardar una pantalla tipo `solicitud`, el backend escribe en una sola
transacción:

```sql
INSERT INTO pantallas (cod_pantalla, descripcion, es_pantalla_plataforma, tipo_pantalla)
VALUES ('SOLICITUD_DESCARTE', 'Solicitud de descarte de equipo', FALSE, 'solicitud');

INSERT INTO procesos (clave, descripcion, cod_flujo)
VALUES ('SOLICITUD_DESCARTE', 'Solicitud de descarte de equipo', <cod_flujo_elegido>);
```

Usa el mismo valor de `cod_pantalla` como `procesos.clave` — el admin ve
un solo formulario, el dato queda correctamente separado.

---

## 3. Ejecución — cuando alguien llena la solicitud real

El formulario específico (ej. "Solicitud de descarte") guarda sus propios
datos en su propia tabla de dominio (ej. `solicitudes_descarte`). Al
enviarla, el backend (dentro del Service de ese dominio):

```sql
SELECT cod_flujo FROM procesos WHERE clave = 'SOLICITUD_DESCARTE';
```

- `cod_flujo IS NULL` → se aprueba directo, sin flujo.
- Con valor → crea `flujo_instancias` (`cod_entidad` = id del registro de
  dominio recién creado), resuelve el primer aprobador vía
  `flujo_pasos.scope` + `cargo`, y crea las filas de `flujo_aprobaciones`.

Esta lógica se factoriza en un **servicio compartido**, no se repite por
cada dominio de solicitud:

```javascript
// models/shared/flujoService.js (pendiente de crear)

/**
 * Adjunta una instancia de flujo a un registro recién creado, si el
 * proceso indicado tiene un flujo configurado.
 * @param {Object} pool - Conexión a la base de datos
 * @param {string} procesoClave - clave de procesos (= cod_pantalla de la solicitud)
 * @param {number} codUsuario - quién inició la solicitud
 * @param {number} codEntidad - cod_ interno del registro de dominio recién creado
 * @returns {Object|null} La flujo_instancia creada, o null si el proceso no requiere flujo
 */
const iniciarFlujoSiAplica = async (pool, procesoClave, codUsuario, codEntidad) => { /* ... */ };

module.exports = { iniciarFlujoSiAplica };
```

Cada Service de solicitud (ej. `descarteService.crearSolicitud`) llama a
esta función después de insertar su propio registro. El Controller y el
endpoint siguen siendo **específicos por tipo de solicitud** — nunca un
endpoint genérico `POST /solicitudes?tipo=X`, para no perder validación
(zod/joi) ni tipado por dominio.

---

## 4. Frontend — `SolicitudShell` + registro estático de formularios

- Cada pantalla `tipo_pantalla = 'solicitud'` se renderiza con un
  componente compartido `SolicitudShell` (recibe `cod_pantalla`).
- `SolicitudShell` es el único que sabe de flujos: si la solicitud está
  en curso, muestra el timeline de aprobación (`flujo_instancias` +
  `flujo_aprobaciones`); si es nueva, renderiza el formulario específico.
- Qué formulario específico renderizar es un **registro estático en
  código** (no generado dinámicamente desde la BD — evitar form-builder,
  es sobre-ingeniería para este proyecto):

```javascript
const FORMULARIOS_SOLICITUD = {
  SOLICITUD_DESCARTE: DescarteForm,
  // se agrega una línea por cada nueva pantalla tipo "solicitud"
};
```

- Cada formulario específico solo conoce sus propios campos y llama a su
  propio endpoint específico (ej. `POST /api/solicitudes/descarte`).

**Resumen del patrón:** dinámico a nivel de "qué pantalla/flujo mostrar",
estático a nivel de "qué campos tiene el formulario".

---

## Checklist de implementación (cuando se retome)

```
BASE DE DATOS
 [ ] Agregar tipo_pantalla ENUM a pantallas
 [ ] Confirmar que procesos.clave sigue usando el mismo valor que cod_pantalla
     para las pantallas tipo solicitud (por convención, no por FK)

BACKEND
 [ ] Endpoint Configuración > Pantallas: transacción pantallas + procesos
 [ ] models/shared/flujoService.js → iniciarFlujoSiAplica()
 [ ] Por cada nueva solicitud: Controller/Service/Model específico que
     llama a iniciarFlujoSiAplica() tras crear su registro de dominio

FRONTEND
 [ ] Componente SolicitudShell (estado, timeline, submit)
 [ ] Registro FORMULARIOS_SOLICITUD por cod_pantalla
 [ ] Primer formulario específico de prueba (ej. DescarteForm)
```

---

*Web-innova Studio · Panamá · 2026*
