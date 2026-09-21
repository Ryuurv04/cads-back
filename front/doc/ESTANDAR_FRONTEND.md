# Estándar de Arquitectura Frontend — Next.js (App Router)

**Guía Maestra de Estructura, Convenciones y Flujo de Datos**

*Versión:* 1.1
*Última Actualización:* Julio 2026
*Framework de Referencia:* Next.js 14+ (App Router)
*Ámbito:* Todos los proyectos frontend de Web-Innova Studio

---

## Índice

1. [Principio Rector](#1-principio-rector)
2. [Estructura Global de Directorios](#2-estructura-global-de-directorios)
3. [Reglas por Capa](#3-reglas-por-capa)
4. [Convenciones de Nomenclatura](#4-convenciones-de-nomenclatura)
5. [Anatomía Obligatoria de un Módulo de Pantalla](#5-anatomía-obligatoria-de-un-módulo-de-pantalla)
6. [Plantilla Base de un Módulo Nuevo](#6-plantilla-base-de-un-módulo-nuevo)
7. [Flujo de Datos Estándar](#7-flujo-de-datos-estándar)
8. [Modo Mock (Sin Backend)](#8-modo-mock-sin-backend)
9. [Checklist Previa a Merge](#9-checklist-previa-a-merge)

---

## 1. Principio Rector

La interfaz de usuario (UI) **no maneja lógica compleja ni llamadas de red**, y los controladores de lógica (Hooks) **no conocen los detalles del diseño visual**. Toda pantalla nueva debe separarse en las mismas 3 piezas, sin excepción, sin importar cuán simple parezca el CRUD.

> ⛔ **Regla crítica:** Si un desarrollador necesita agregar un `fetch`/`axios` dentro de un `page.jsx`, algo está mal estructurado — la llamada pertenece a `services/`, invocada desde el hook del módulo.

---

## 2. Estructura Global de Directorios

```text
src/
├── config/
│   └── apiConfig.js         # Único archivo de configuración de endpoints
├── context/
│   └── AuthContext.js       # Contextos y estados globales de la aplicación
├── services/                # Capa de infraestructura y comunicación API
│   ├── apiClient.js         # Instancia base de Axios con interceptores
│   ├── authService.js       # Endpoints agrupados por dominio de negocio
│   ├── cuentasService.js
│   └── presupuestosService.js
└── app/                     # Capa de Enrutamiento y Presentación
    ├── componentes/         # Componentes GLOBALES y reutilizables (UI/Layout)
    │   ├── UI/               # Botones, inputs, dropdowns genéricos
    │   └── Layout/            # Sidebar, Navbar, Footer
    │
    ├── (paginas)/            # GRUPO DE RUTAS: módulos de pantalla (no altera la URL)
    │   ├── login/             # Ruta física: /login
    │   │   └── page.jsx
    │   │
    │   └── presupuestos/      # Ruta física: /presupuestos (módulo modelo)
    │       ├── formulario/     # Sub-módulo para formularios del ciclo modal
    │       │   ├── FormPresupuesto.jsx
    │       │   └── useFormPresupuesto.js
    │       ├── page.jsx        # SÓLO maquetación (HTML + Tailwind)
    │       └── usePresupuestos.js  # SÓLO lógica de estado (custom hook)
    │
    ├── layout.jsx            # Layout raíz del sistema
    └── page.jsx               # Landing page (/)
```

**Ninguna carpeta nueva debe desviarse de este árbol.** Si un módulo necesita algo adicional (por ejemplo un sub-listado), se anida dentro de su propia carpeta en `(paginas)/`, nunca fuera de ella.

---

## 3. Reglas por Capa

### 3.1 Configuración (`src/config/apiConfig.js`)

Centraliza las variables de entorno para los endpoints del backend. **No se permite** escribir URLs como cadenas de texto sueltas en ningún otro archivo del sistema.

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export default API_BASE_URL;
```

---

### 3.2 Servicios (`src/services/`)

| Archivo | Responsabilidad |
|---------|-----------------|
| `apiClient.js` | Instancia única de Axios. Contiene el interceptor que inyecta `Authorization: Bearer <token>` desde `localStorage`, y el manejador global de `401` que destruye la sesión y redirige a `/login`. |
| `[dominio]Service.js` | Un archivo por entidad de negocio (`cuentasService.js`, `presupuestosService.js`, `transaccionesService.js`...). Exporta un objeto plano con métodos que retornan la promesa de Axios. |

**Convención de métodos obligatoria** — todo `[dominio]Service.js` expone los mismos verbos, en este orden y con estos nombres exactos (salvo que la entidad no soporte alguno):

```javascript
const entidadService = {
  listar: (params) => apiClient.get('/entidad', { params }),
  obtener: (uuid_entidad) => apiClient.get(`/entidad/${uuid_entidad}`),
  crear: (datos) => apiClient.post('/entidad', datos),
  actualizar: (uuid_entidad, datos) => apiClient.put(`/entidad/${uuid_entidad}`, datos),
  eliminar: (uuid_entidad) => apiClient.delete(`/entidad/${uuid_entidad}`),
};

export default entidadService;
```

> ⛔ **Regla crítica de campos:** el frontend identifica y referencia registros **exclusivamente por `uuid_*`** (el identificador público del backend). El campo `cod_*` es interno del backend y **nunca** debe viajar, guardarse en estado, ni usarse como `key` de React en el frontend.

---

### 3.3 Contexto (`src/context/`)

Contiene únicamente estados verdaderamente globales (sesión de usuario, tema, preferencias). Un módulo de pantalla **no crea su propio Context** — su estado vive en su hook (`use[Modulo].js`).

---

### 3.4 Componentes Globales (`src/app/componentes/`)

Viven dentro de `app/` pero quedan aislados de las rutas porque no contienen `page.jsx`.

| Carpeta | Contenido |
|---------|-----------|
| `UI/` | Componentes atómicos reutilizables en todo el sistema (botones, inputs, badges, dropdowns) |
| `Layout/` | Piezas estructurales compartidas (Sidebar, Navbar, Footer) |

Un componente entra aquí **solo si se usa en 2 o más módulos distintos**. Si es exclusivo de una pantalla, vive dentro de la carpeta de ese módulo.

---

### 3.5 Grupo de Rutas (`src/app/(paginas)/`)

La nomenclatura de paréntesis agrupa los módulos de negocio sin ensuciar la URL con la palabra "paginas". Toda pantalla de negocio nueva se crea aquí, nunca directamente bajo `app/`.

---

## 4. Convenciones de Nomenclatura

| Elemento | Regla | Ejemplo |
|----------|-------|---------|
| Carpeta de módulo | Plural, minúsculas | `presupuestos/`, `cuentas/`, `transacciones/` |
| Hook de módulo | `use` + nombre del módulo en PascalCase | `usePresupuestos.js` |
| Hook de formulario | `useForm` + entidad en singular PascalCase | `useFormPresupuesto.js` |
| Componente de formulario | `Form` + entidad en singular PascalCase | `FormPresupuesto.jsx` |
| Service | entidad en plural + `Service` | `presupuestosService.js` |
| Funciones dentro de un hook | Verbo en español, cameCase | `cargarPresupuestos`, `abrirFormulario`, `guardarPresupuesto`, `eliminarPresupuesto` |
| Variables de estado de listas | Sustantivo plural | `presupuestos`, `categorias` |
| Variables de estado de bandera | `cargando`, `error` (siempre estos nombres, no `loading`/`isLoading` mezclados) | — |
| Identificador de registro | Siempre `uuid_[entidad]`, nunca `id` ni `cod_[entidad]` | `uuid_presupuesto` |
| Idioma | Todo el código de negocio (variables, funciones, comentarios) en **español**. Las keywords de React/JS quedan en inglés por sintaxis (`useState`, `useEffect`, etc.) | — |

> ✅ Mantener el idioma y los verbos consistentes entre módulos es lo que permite que cualquier desarrollador nuevo lea `useCuentas.js` y ya sepa cómo se comporta `usePresupuestos.js`, sin tener que revisar el código.

---

## 5. Anatomía Obligatoria de un Módulo de Pantalla

Toda pantalla dentro de `(paginas)/` se divide en 3 piezas, sin excepción:

### 5.1 La Vista (`page.jsx`)

Archivo de presentación puro (`'use client'`).

- ✅ **Permitido:** estructura HTML, clases Tailwind, animaciones, interactividad simple de UI. Llama funciones devueltas por el hook en eventos (`onClick`, `onChange`).
- ⛔ **Prohibido:** `useEffect`, `useState` para datos del backend, mutar datos directamente, invocar `services/` directamente.
- **Inyección de modales:** si requiere un formulario vía SweetAlert2, pasa el JSX al hook, que lo monta con `formRef`.

### 5.2 El Controlador de Estado (`use[Modulo].js`)

Custom Hook que maneja el ciclo de vida de los datos de la pantalla.

- ✅ **Permitido:** estados de `cargando`/`error`, paginación, filtros locales, lógica de confirmación/alertas SweetAlert2. Consume `src/services/`.
- ⛔ **Prohibido:** retornar JSX pesado o acoplarse a diseño rígido. Debe retornar datos primitivos, colecciones y funciones listas para consumir.

### 5.3 El Sub-Módulo de Formularios (`formulario/`)

Cuando la pantalla captura datos para un CRUD:

- **`Form[Entidad].jsx`:** usa `forwardRef` para que SweetAlert2 valide y extraiga datos antes de cerrar el modal.
- **`useForm[Entidad].js`:** gestiona inputs, valida campos requeridos y expone `getFormData()` al padre vía `useImperativeHandle`.

---

## 6. Plantilla Base de un Módulo Nuevo

Copiar esta plantilla al crear cualquier módulo. Sustituir `[Entidad]`/`[entidad]`/`[modulo]` por el nombre real.

```text
(paginas)/[modulo]/
├── formulario/
│   ├── Form[Entidad].jsx
│   └── useForm[Entidad].js
├── page.jsx
└── use[Modulo].js
```

**`use[Modulo].js` — esqueleto mínimo:**

```javascript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import [entidad]Service from '@/services/[entidad]Service';
import Form[Entidad] from './formulario/Form[Entidad]';

export default function use[Modulo]() {
  const [[modulo], set[Modulo]] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const cargar[Modulo] = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await [entidad]Service.listar();
      set[Modulo](data);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar la información');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar[Modulo]();
  }, [cargar[Modulo]]);

  const abrirFormulario = (registroInicial = null) => {
    const contenedor = document.createElement('div');
    Swal.fire({
      title: registroInicial ? 'Editar' : 'Nuevo',
      html: contenedor,
      showCancelButton: true,
      didOpen: () => {
        const root = createRoot(contenedor);
        root.render(<Form[Entidad] ref={formRef} registroInicial={registroInicial} />);
      },
      preConfirm: () => {
        if (!formRef.current?.validate()) {
          Swal.showValidationMessage('Revisa los campos marcados');
          return false;
        }
        return formRef.current?.getFormData();
      },
    }).then((resultado) => {
      if (resultado.isConfirmed && resultado.value) {
        guardar(resultado.value, registroInicial?.uuid_[entidad]);
      }
    });
  };

  const guardar = async (datos, uuidExistente) => {
    setCargando(true);
    try {
      if (uuidExistente) {
        await [entidad]Service.actualizar(uuidExistente, datos);
      } else {
        await [entidad]Service.crear(datos);
      }
      await Swal.fire('Listo', 'Guardado correctamente', 'success');
      cargar[Modulo]();
    } catch (err) {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (uuid_[entidad]) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar?',
      icon: 'warning',
      showCancelButton: true,
    });
    if (confirmacion.isConfirmed) {
      await [entidad]Service.eliminar(uuid_[entidad]);
      cargar[Modulo]();
    }
  };

  return { [modulo], cargando, error, abrirFormulario, eliminar };
}
```

---

## 7. Flujo de Datos Estándar

1. El usuario hace clic en "Guardar" dentro de un modal abierto por SweetAlert2 en `page.jsx`.
2. El hook orquestador `use[Modulo].js` intercepta el evento y ejecuta `formRef.current.validate()`.
3. `useForm[Entidad].js` procesa la validación interna. Si es válida, retorna los datos limpios vía `getFormData()`.
4. `use[Modulo].js` toma el objeto limpio, activa `cargando`, y llama al `service` correspondiente.
5. Tras el éxito, el hook lanza una alerta global y refresca la lista. `page.jsx` se re-renderiza automáticamente con la nueva información.

---

## 8. Modo Mock (Sin Backend)

Todo proyecto debe poder arrancar y demostrarse **sin backend real**, controlado por una sola variable de entorno:

```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true
```

### 8.1 Estructura

```text
src/services/
├── mocks/
│   ├── mockClient.js        # USE_MOCK, mockResponse(data), mockError(mensaje, opts)
│   ├── auth.mock.js         # Fixtures del dominio de sesión
│   └── [dominio].mock.js    # Un archivo de fixtures por dominio de negocio
├── api.js
└── [entidad]Service.js
```

### 8.2 Regla obligatoria por servicio

Todo método de `[entidad]Service.js` (y de `authService`) empieza con el branch mock. Nunca se mockea a nivel de `page.jsx` ni de hook — el mock vive exclusivamente en `services/`, así el resto del código no sabe (ni le importa) si el backend está presente:

```javascript
listar: (params) => {
    if (!USE_MOCK) return apiClient.get('/entidad', { params });
    return mockResponse({ data: MOCK_ENTIDAD, totalPages: 1 });
},
```

- `mockResponse(data, { delay, status })` — resuelve con la forma `{ data, status }` (igual que Axios), simulando latencia real.
- `mockError(mensaje, { delay, status })` — rechaza con la forma `error.response.data.message` (igual que un error de Axios), para que el manejo de errores en el hook no necesite ninguna rama especial.
- Los datos mock que representan estado (listas, catálogos) se mutan en memoria dentro del propio archivo de fixtures cuando el flujo lo requiere (crear/editar/eliminar), para que la pantalla se sienta funcional de extremo a extremo.

### 8.3 Reglas

> ⛔ **Prohibido:** `fetch`/`axios` sueltos en `page.jsx` o en un hook que evadan `services/` — eso también evade el mock y rompe el modo sin backend.

> ✅ `NEXT_PUBLIC_USE_MOCK` se documenta en `.env.example` (el único archivo `.env*` que se versiona) con su default en `false`.

---

## 9. Checklist Previa a Merge

Verificar antes de aprobar cualquier Pull Request que agregue o modifique un módulo:

```
ESTRUCTURA
 [ ] El módulo vive dentro de (paginas)/[modulo]/ con las 3 piezas obligatorias
 [ ] No hay lógica de estado ni llamadas a services/ dentro de page.jsx
 [ ] No hay JSX pesado retornado por el hook de estado
 [ ] Componentes usados en 2+ módulos están movidos a app/componentes/

NOMENCLATURA
 [ ] Hook de módulo se llama use[Modulo].js
 [ ] Service sigue el patrón listar/obtener/crear/actualizar/eliminar
 [ ] Variables de bandera son cargando/error (no loading/isLoading mezclados)
 [ ] Todo el código de negocio está en español

DATOS
 [ ] El frontend solo referencia registros por uuid_[entidad], nunca cod_[entidad] ni id
 [ ] No hay URLs de API escritas como texto suelto fuera de apiConfig.js/services/

FORMULARIOS
 [ ] Form[Entidad].jsx usa forwardRef + useImperativeHandle (validate, getFormData)
 [ ] useForm[Entidad].js contiene toda la validación, no page.jsx ni use[Modulo].js

SESIÓN
 [ ] Ninguna pantalla protegida asume sesión activa sin pasar por AuthContext
 [ ] El manejo de 401 se apoya en el interceptor de apiClient.js, no duplicado por módulo

MOCK
 [ ] Todo método nuevo en un service tiene su branch `if (!USE_MOCK) ...` desde el día uno
 [ ] La pantalla funciona de extremo a extremo con NEXT_PUBLIC_USE_MOCK=true, sin backend
```

---

*Web-Innova Studio · Panamá · 2026*
