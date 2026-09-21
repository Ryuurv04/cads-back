
-- ===========================================================================
-- Plantilla Base de Datos — Núcleo RBAC + Estructura Organizacional
--                            + Motor de Flujos de Aprobación + Dashboard
-- Estándares Web-innova Studio v1.0
-- Fecha: Julio 2026
-- ===========================================================================

BEGIN;

-- Drop en orden inverso de dependencias (hijos antes que padres)
DROP TABLE IF EXISTS dashboard_configs;
DROP TABLE IF EXISTS widget_catalog;
DROP TABLE IF EXISTS flujo_aprobaciones;
DROP TABLE IF EXISTS flujo_instancias;
DROP TABLE IF EXISTS procesos;
DROP TABLE IF EXISTS flujo_pasos;
DROP TABLE IF EXISTS flujos;
DROP TABLE IF EXISTS usuario_rol;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS cargos;
DROP TABLE IF EXISTS sub_area;
DROP TABLE IF EXISTS area;
DROP TABLE IF EXISTS roles_pantallas;
DROP TABLE IF EXISTS roles_permisos;
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS pantallas;
DROP TABLE IF EXISTS roles;


-- ===========================================================================
-- SECCIÓN 1 — NÚCLEO RBAC (roles, permisos funcionales, pantallas)
-- ===========================================================================

-- =============================================================================
-- TABLA: roles
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Catálogo de roles del sistema que definen el nivel de acceso
--              de cada usuario.
-- =============================================================================
CREATE TABLE roles (

    cod_rol     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_rol    VARCHAR(36) UNIQUE NOT NULL
                COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    nombre_rol  VARCHAR(50) NOT NULL
                COMMENT 'Nombre descriptivo del rol (ej. SuperAdmin, Coordinador, Técnico)',

    descripcion VARCHAR(255) NULL
                COMMENT 'Descripción detallada de las responsabilidades y alcance del rol',

    is_activo   BOOLEAN NOT NULL DEFAULT TRUE
                COMMENT 'FALSE = rol desactivado, no aparece en el flujo de asignación',

    UNIQUE KEY uq_rol_nombre (nombre_rol)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: permisos
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Capacidades funcionales que no dependen del nivel de una
--              pantalla, sino de una acción concreta que puede ocurrir en
--              cualquier pantalla o cruzar varias (ej. APROBAR_DESCARTE).
--              Diferencia con roles_pantallas.nivel: el nivel controla
--              cuánto puedes hacer DENTRO de una pantalla; el permiso te
--              habilita para una acción puntual fuera de ese control.
--              El JWT incluye la lista de claves de permiso del usuario —
--              en el controller: req.usuario.permisos.includes('APROBAR_DESCARTE').
-- =============================================================================
CREATE TABLE permisos (

    cod_permiso  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                 COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_permiso VARCHAR(36) UNIQUE NOT NULL
                 COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    clave        VARCHAR(50) NOT NULL
                 COMMENT 'Clave semántica en mayúsculas del permiso (ej. APROBAR_DESCARTE, GESTIONAR_CONFIG)',

    descripcion  VARCHAR(255) NULL
                 COMMENT 'Descripción de la acción concreta que habilita este permiso',

    is_activo    BOOLEAN NOT NULL DEFAULT TRUE
                 COMMENT 'FALSE = permiso desactivado, no se evalúa ni se asigna',

    UNIQUE KEY uq_permiso_clave (clave)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: roles_permisos
-- TIPO: Pivote
-- DESCRIPCIÓN: Asigna permisos funcionales puntuales a un rol.
--              DELETE directo permitido en esta tabla.
-- =============================================================================
CREATE TABLE roles_permisos (

    cod_rol     BIGINT UNSIGNED NOT NULL
                COMMENT 'FK estándar → tabla [roles](cod_rol)',

    cod_permiso BIGINT UNSIGNED NOT NULL
                COMMENT 'FK estándar → tabla [permisos](cod_permiso)',

    PRIMARY KEY (cod_rol, cod_permiso),

    FOREIGN KEY (cod_rol)     REFERENCES roles(cod_rol)       ON DELETE CASCADE,
    FOREIGN KEY (cod_permiso) REFERENCES permisos(cod_permiso) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: pantallas
-- TIPO: Catálogo fijo
-- DESCRIPCIÓN: Catálogo de todas las pantallas/módulos del sistema. Cada
--              pantalla tiene una clave semántica en mayúsculas usada
--              directamente en el middleware checkNivel del backend.
-- EXCEPCIÓN DE ESTÁNDAR: Usa cod_pantalla VARCHAR(50) como PK semántica en
--                        lugar del patrón BIGINT+UUID — justificado porque
--                        es una tabla de catálogo de deploy, no operativa.
-- =============================================================================
CREATE TABLE pantallas (

    cod_pantalla           VARCHAR(50) NOT NULL
                           COMMENT 'Clave semántica en mayúsculas que identifica la pantalla (ej. GESTION_USUARIOS). Se usa directamente en el middleware checkNivel.',

    descripcion            VARCHAR(150) NOT NULL
                           COMMENT 'Descripción legible del módulo o sección que representa esta pantalla',

    es_pantalla_plataforma BOOLEAN NOT NULL DEFAULT FALSE
                           COMMENT 'TRUE = pantalla exclusiva del SuperAdmin. FALSE = pantalla operativa disponible para roles del sistema.',

    PRIMARY KEY (cod_pantalla)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: roles_pantallas
-- TIPO: Pivote
-- DESCRIPCIÓN: Matriz de accesos que define el nivel de permiso de cada rol
--              en cada pantalla del sistema.
--              0=Sin acceso | 1=Lectura | 2=Edición | 3=Total
--              DELETE directo permitido en esta tabla.
-- =============================================================================
CREATE TABLE roles_pantallas (

    cod_rol      BIGINT UNSIGNED NOT NULL
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


-- ===========================================================================
-- SECCIÓN 2 — ESTRUCTURA ORGANIZACIONAL (area, sub_area, cargos)
-- ===========================================================================

-- =============================================================================
-- TABLA: area
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Áreas institucionales de primer nivel (ej. ADM, TEC).
-- =============================================================================
CREATE TABLE area (

    cod_area    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_area   VARCHAR(36) UNIQUE NOT NULL
                COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    descripcion VARCHAR(50) NOT NULL
                COMMENT 'Nombre del área institucional (ej. ADM, TEC)',

    is_activo   BOOLEAN NOT NULL DEFAULT TRUE
                COMMENT 'FALSE = área desactivada, no aparece en los selectores'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: sub_area
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Sub-áreas dentro de un área institucional (ej. TIC,
--              Contabilidad, Mantenimiento dentro de ADM).
-- =============================================================================
CREATE TABLE sub_area (

    cod_subarea  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                 COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_subarea VARCHAR(36) UNIQUE NOT NULL
                 COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    cod_area     BIGINT UNSIGNED NOT NULL
                 COMMENT 'FK estándar → tabla [area](cod_area)',

    descripcion  VARCHAR(50) NOT NULL
                 COMMENT 'Nombre de la sub-área (ej. TIC, Contabilidad, Mantenimiento)',

    is_activo    BOOLEAN NOT NULL DEFAULT TRUE
                 COMMENT 'FALSE = sub-área desactivada, no aparece en los selectores',

    FOREIGN KEY (cod_area) REFERENCES area(cod_area) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: cargos
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Posiciones en la jerarquía institucional. El campo "nivel"
--              define la cadena de aprobación que usa el motor de flujos
--              para resolver quién debe aprobar cada paso de una solicitud:
--                1 = Operativo (técnicos, analistas, especialistas)
--                2 = Coordinador
--                3 = Subdirector
--                4 = Director
-- =============================================================================
CREATE TABLE cargos (

    cod_cargo  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
               COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_cargo VARCHAR(36) UNIQUE NOT NULL
               COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    nombre     VARCHAR(100) NOT NULL
               COMMENT 'Nombre del cargo (ej. Técnico, Coordinador de TIC, Subdirector de ADM, Director)',

    nivel      TINYINT NOT NULL
               COMMENT 'Nivel jerárquico: 1=Operativo, 2=Coordinador, 3=Subdirector, 4=Director',

    is_activo  BOOLEAN NOT NULL DEFAULT TRUE
               COMMENT 'FALSE = cargo desactivado, no aparece en los selectores',

    CONSTRAINT chk_nivel_cargo CHECK (nivel BETWEEN 1 AND 4),

    UNIQUE KEY uq_cargo_nombre (nombre)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ===========================================================================
-- SECCIÓN 3 — USUARIOS
-- ===========================================================================

-- =============================================================================
-- TABLA: usuarios
-- TIPO: Operativa
-- DESCRIPCIÓN: Empleados/operadores registrados en el sistema, ubicados en
--              una sub-área y con un cargo dentro de la jerarquía institucional.
-- =============================================================================
CREATE TABLE usuarios (

    cod_usuario        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                       COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_usuario       VARCHAR(36) UNIQUE NOT NULL
                       COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    cod_subarea        BIGINT UNSIGNED NOT NULL
                       COMMENT 'FK estándar → tabla [sub_area](cod_subarea)',

    cod_cargo          BIGINT UNSIGNED NOT NULL
                       COMMENT 'FK estándar → tabla [cargos](cod_cargo)',

    num_empleado       INT  NULL
                       COMMENT 'Número de empleado asignado por Recursos Humanos',

    correo             VARCHAR(100) UNIQUE NOT NULL
                       COMMENT 'Correo electrónico corporativo — usado como credencial de acceso al sistema',

    password           VARCHAR(255) NOT NULL
                       COMMENT 'Contraseña encriptada con bcrypt — nunca almacenar en texto plano',

    nombre             VARCHAR(100) NOT NULL
                       COMMENT 'Primer nombre del usuario',

    segundo_nombre     VARCHAR(100) NULL
                       COMMENT 'Segundo nombre del usuario — opcional',

    apellido           VARCHAR(100) NOT NULL
                       COMMENT 'Primer apellido del usuario',

    segundo_apellido   VARCHAR(100) NULL
                       COMMENT 'Segundo apellido del usuario — opcional',

    estado             VARCHAR(1) NOT NULL DEFAULT 'A'
                       COMMENT 'Estado de la cuenta — "A" indica cuenta activa, "I" indica cuenta inactiva',

    reset_token        VARCHAR(255) NULL DEFAULT NULL
                       COMMENT 'Token temporal para el proceso de recuperación de contraseña',

    reset_token_expiry DATETIME NULL DEFAULT NULL
                       COMMENT 'Fecha y hora de expiración del reset_token — NULL si no hay proceso activo',

    fecha_creado       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                       COMMENT 'Fecha de creación del registro',

    fecha_eliminado    TIMESTAMP NULL DEFAULT NULL
                       COMMENT 'Control de borrado lógico — NULL indica que el registro está activo',

    CONSTRAINT chk_estado_usuario CHECK (estado IN ('A','I')),

    FOREIGN KEY (cod_subarea) REFERENCES sub_area(cod_subarea) ON DELETE RESTRICT,
    FOREIGN KEY (cod_cargo)   REFERENCES cargos(cod_cargo)      ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: usuario_rol
-- TIPO: Pivote
-- DESCRIPCIÓN: Roles asignados a cada usuario — un usuario puede tener
--              más de un rol.
--              DELETE directo permitido en esta tabla.
-- =============================================================================
CREATE TABLE usuario_rol (

    cod_usuario      BIGINT UNSIGNED NOT NULL
                     COMMENT 'FK estándar → tabla [usuarios](cod_usuario)',

    cod_rol          BIGINT UNSIGNED NOT NULL
                     COMMENT 'FK estándar → tabla [roles](cod_rol)',

    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                     COMMENT 'Fecha en que se asignó este rol al usuario',

    PRIMARY KEY (cod_usuario, cod_rol),

    FOREIGN KEY (cod_usuario) REFERENCES usuarios(cod_usuario) ON DELETE CASCADE,
    FOREIGN KEY (cod_rol)     REFERENCES roles(cod_rol)         ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ===========================================================================
-- SECCIÓN 4 — MOTOR DE FLUJOS DE APROBACIÓN
-- ===========================================================================
-- Gestiona cualquier proceso institucional que requiera aprobaciones en
-- cadena. La configuración de los pasos es estática (se define una vez en
-- flujos/flujo_pasos); la ejecución es dinámica (flujo_instancias/
-- flujo_aprobaciones, una fila nueva por cada solicitud real).
--
-- Resolución del aprobador según flujo_pasos.scope:
--   'subarea' → busca el cargo dentro de la sub_area del solicitante
--   'area'    → busca el cargo dentro del area del solicitante
--   'global'  → busca el cargo sin filtrar por area (ej. Director único)
-- ===========================================================================

-- =============================================================================
-- TABLA: flujos
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Catálogo de tipos de flujo de aprobación disponibles en el
--              sistema (ej. Descarte de equipo, Solicitud de compra).
-- =============================================================================
CREATE TABLE flujos (

    cod_flujo   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_flujo  VARCHAR(36) UNIQUE NOT NULL
                COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    nombre      VARCHAR(100) NOT NULL
                COMMENT 'Nombre descriptivo del flujo (ej. Descarte de equipo, Solicitud de compra)',

    descripcion VARCHAR(255) NULL
                COMMENT 'Descripción del propósito de este flujo de aprobación',

    is_activo   BOOLEAN NOT NULL DEFAULT TRUE
                COMMENT 'FALSE = flujo desactivado, no se puede iniciar en nuevos procesos',

    UNIQUE KEY uq_flujo_nombre (nombre)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: flujo_pasos
-- TIPO: Catálogo desactivable
-- DESCRIPCIÓN: Pasos ordenados de cada flujo. "scope" define desde dónde
--              buscar al aprobador según el solicitante (ver nota de
--              sección arriba).
-- =============================================================================
CREATE TABLE flujo_pasos (

    cod_paso   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
               COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_paso  VARCHAR(36) UNIQUE NOT NULL
               COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    cod_flujo  BIGINT UNSIGNED NOT NULL
               COMMENT 'FK estándar → tabla [flujos](cod_flujo)',

    orden      TINYINT NOT NULL
               COMMENT 'Orden de ejecución del paso dentro del flujo (1, 2, 3...)',

    cod_cargo  BIGINT UNSIGNED NOT NULL
               COMMENT 'FK estándar → tabla [cargos](cod_cargo) — cargo que debe aprobar este paso',

    scope      VARCHAR(10) NOT NULL DEFAULT 'subarea'
               COMMENT 'Ámbito de búsqueda del aprobador: subarea, area o global',

    CONSTRAINT chk_scope CHECK (scope IN ('subarea', 'area', 'global')),

    UNIQUE KEY uq_flujo_orden (cod_flujo, orden),

    FOREIGN KEY (cod_flujo) REFERENCES flujos(cod_flujo) ON DELETE CASCADE,
    FOREIGN KEY (cod_cargo) REFERENCES cargos(cod_cargo)  ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: procesos
-- TIPO: Catálogo fijo
-- DESCRIPCIÓN: Bisagra entre un evento de negocio y el motor de flujos —
--              el backend nunca hardcodea qué flujo usar para qué proceso,
--              siempre consulta esta tabla. Si cod_flujo es NULL el proceso
--              no requiere aprobación. Agregar un proceso nuevo (ej.
--              VACACIONES) es solo un INSERT aquí, sin cambios en el motor.
-- EXCEPCIÓN DE ESTÁNDAR: Usa clave VARCHAR(50) como PK semántica en lugar
--                        del patrón BIGINT+UUID, igual que [pantallas].
-- =============================================================================
CREATE TABLE procesos (

    clave       VARCHAR(50) NOT NULL
                COMMENT 'Clave semántica en mayúsculas del proceso de negocio (ej. DESCARTE, VACACIONES)',

    descripcion VARCHAR(150) NOT NULL
                COMMENT 'Descripción legible del proceso de negocio',

    cod_flujo   BIGINT UNSIGNED NULL
                COMMENT 'FK estándar → tabla [flujos](cod_flujo). NULL = el proceso se aprueba directamente, sin flujo.',

    PRIMARY KEY (clave),

    FOREIGN KEY (cod_flujo) REFERENCES flujos(cod_flujo) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: flujo_instancias
-- TIPO: Operativa
-- DESCRIPCIÓN: Instancia activa de un flujo — una fila por cada solicitud
--              real que pasó por procesos.cod_flujo. Guarda el cod_flujo
--              como snapshot porque procesos.cod_flujo puede cambiar luego
--              y una instancia ya iniciada debe seguir el flujo original.
-- =============================================================================
CREATE TABLE flujo_instancias (

    cod_instancia  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                   COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_instancia VARCHAR(36) UNIQUE NOT NULL
                   COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    proceso_clave  VARCHAR(50) NOT NULL
                   COMMENT 'FK ESPECIAL → tabla [procesos](clave). Nombre distinto de "clave" por claridad, ya que esta tabla referencia varias entidades.',

    cod_flujo      BIGINT UNSIGNED NOT NULL
                   COMMENT 'FK estándar → tabla [flujos](cod_flujo) — snapshot del flujo vigente al momento de crear la instancia',

    cod_usuario    BIGINT UNSIGNED NOT NULL
                   COMMENT 'FK estándar → tabla [usuarios](cod_usuario) — quién inició la solicitud',

    cod_entidad    BIGINT UNSIGNED NOT NULL
                   COMMENT 'FK POLIMÓRFICA — cod_ interno del registro relacionado en la tabla propia del proceso (ej. cod_equipo si proceso_clave=DESCARTE). No tiene FK real de MySQL porque la tabla destino varía según proceso_clave.',

    paso_actual    TINYINT NOT NULL DEFAULT 1
                   COMMENT 'Número de paso (flujo_pasos.orden) en el que se encuentra actualmente la instancia',

    estado         VARCHAR(1) NOT NULL DEFAULT 'P'
                   COMMENT 'Estado de la instancia: P=Pendiente, A=Aprobado, R=Rechazado, C=Cancelado',

    fecha_creado   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                   COMMENT 'Fecha de creación del registro',

    fecha_cierre   DATETIME NULL DEFAULT NULL
                   COMMENT 'Fecha en que la instancia llegó a un estado final (A, R o C) — NULL mientras está en curso',

    fecha_eliminado TIMESTAMP NULL DEFAULT NULL
                   COMMENT 'Control de borrado lógico — NULL indica que el registro está activo',

    CONSTRAINT chk_estado_instancia CHECK (estado IN ('P','A','R','C')),

    FOREIGN KEY (proceso_clave) REFERENCES procesos(clave)       ON DELETE RESTRICT,
    FOREIGN KEY (cod_flujo)     REFERENCES flujos(cod_flujo)     ON DELETE RESTRICT,
    FOREIGN KEY (cod_usuario)   REFERENCES usuarios(cod_usuario) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: flujo_aprobaciones
-- TIPO: Operativa
-- DESCRIPCIÓN: Registro inmutable de cada aprobación/rechazo por paso.
--              Es un ledger de auditoría — no se implementa fecha_eliminado
--              porque estos registros nunca deben "desaparecer" del historial.
-- =============================================================================
CREATE TABLE flujo_aprobaciones (

    cod_aprobacion  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
                    COMMENT 'Llave primaria interna — solo para JOINs y rendimiento, nunca exponer en API',

    uuid_aprobacion VARCHAR(36) UNIQUE NOT NULL
                    COMMENT 'Identificador público UUID v4 — único código que viaja a la API y el frontend',

    cod_instancia   BIGINT UNSIGNED NOT NULL
                    COMMENT 'FK estándar → tabla [flujo_instancias](cod_instancia)',

    cod_paso        BIGINT UNSIGNED NOT NULL
                    COMMENT 'FK estándar → tabla [flujo_pasos](cod_paso)',

    cod_aprobador   BIGINT UNSIGNED NULL
                    COMMENT 'FK estándar → tabla [usuarios](cod_usuario) — se resuelve al llegar el turno de este paso',

    estado          VARCHAR(1) NOT NULL DEFAULT 'P'
                    COMMENT 'Estado de esta aprobación: P=Pendiente, A=Aprobado, R=Rechazado',

    observacion     VARCHAR(255) NULL
                    COMMENT 'Comentario del aprobador al aprobar o rechazar — opcional',

    fecha_creado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    COMMENT 'Fecha de creación del registro (cuando el paso quedó a la espera de este aprobador)',

    fecha           DATETIME NULL
                    COMMENT 'Fecha en que el aprobador resolvió (aprobó o rechazó) este paso — NULL mientras está pendiente',

    CONSTRAINT chk_estado_aprobacion CHECK (estado IN ('P','A','R')),

    UNIQUE KEY uq_instancia_paso (cod_instancia, cod_paso),

    FOREIGN KEY (cod_instancia) REFERENCES flujo_instancias(cod_instancia) ON DELETE RESTRICT,
    FOREIGN KEY (cod_paso)      REFERENCES flujo_pasos(cod_paso)           ON DELETE RESTRICT,
    FOREIGN KEY (cod_aprobador) REFERENCES usuarios(cod_usuario)           ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bandeja de aprobaciones pendientes de un usuario (consulta más frecuente:
-- "¿qué tengo que aprobar hoy?")
CREATE INDEX idx_aprobaciones_aprobador ON flujo_aprobaciones (cod_aprobador, estado);


-- ===========================================================================
-- SECCIÓN 5 — DASHBOARD CONFIGURABLE POR ROL
-- ===========================================================================

-- =============================================================================
-- TABLA: widget_catalog
-- TIPO: Catálogo fijo
-- DESCRIPCIÓN: Fuente de verdad de todos los widgets disponibles en el
--              sistema. El frontend la consulta para saber qué widgets
--              ofrecer en la pantalla de configuración del dashboard.
--              span_default = columnas que ocupa en el grid de 12 (1-12).
--              categoria: kpi (tarjeta de número), grafico, tabla, lista,
--              progreso (barra de avance).
-- EXCEPCIÓN DE ESTÁNDAR: Usa widget_key VARCHAR(50) como PK semántica en
--                        lugar del patrón BIGINT+UUID, igual que [pantallas].
-- =============================================================================
CREATE TABLE widget_catalog (

    widget_key   VARCHAR(50) NOT NULL
                 COMMENT 'Clave semántica del widget usada por el frontend para renderizarlo (ej. kpiUsuarios)',

    label        VARCHAR(100) NOT NULL
                 COMMENT 'Nombre legible del widget mostrado en la UI de configuración',

    descripcion  VARCHAR(200) NULL
                 COMMENT 'Descripción de qué información muestra este widget',

    categoria    VARCHAR(20) NOT NULL DEFAULT 'kpi'
                 COMMENT 'Agrupación en la UI de configuración: kpi, grafico, tabla, lista o progreso',

    span_default TINYINT NOT NULL DEFAULT 3
                 COMMENT 'Columnas que ocupa por defecto en el grid de 12',

    is_activo    BOOLEAN NOT NULL DEFAULT TRUE
                 COMMENT 'FALSE = widget desactivado, no aparece en la UI de configuración',

    PRIMARY KEY (widget_key),

    CONSTRAINT chk_span CHECK (span_default BETWEEN 1 AND 12),
    CONSTRAINT chk_cat  CHECK (categoria IN ('kpi','grafico','tabla','lista','progreso'))

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TABLA: dashboard_configs
-- TIPO: Pivote
-- DESCRIPCIÓN: Una fila por cada widget que tiene un rol configurado en su
--              dashboard, con el orden de renderizado. Si un rol no tiene
--              filas aquí, el frontend usa un set por defecto (DASH_SETS)
--              como fallback.
--              DELETE directo permitido en esta tabla.
-- =============================================================================
CREATE TABLE dashboard_configs (

    cod_rol    BIGINT UNSIGNED NOT NULL
               COMMENT 'FK estándar → tabla [roles](cod_rol)',

    widget_key VARCHAR(50) NOT NULL
               COMMENT 'FK estándar → tabla [widget_catalog](widget_key)',

    orden      TINYINT NOT NULL
               COMMENT 'Posición del widget dentro del dashboard de este rol',

    PRIMARY KEY (cod_rol, widget_key),

    UNIQUE KEY uq_rol_orden (cod_rol, orden),

    FOREIGN KEY (cod_rol)    REFERENCES roles(cod_rol)             ON DELETE CASCADE,
    FOREIGN KEY (widget_key) REFERENCES widget_catalog(widget_key) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consulta principal del dashboard: widgets de un rol ordenados
CREATE INDEX idx_dashcfg_rol ON dashboard_configs (cod_rol, orden);

-- Consulta de catálogo: widgets activos por categoría (para la UI de config)
CREATE INDEX idx_catalog_categoria ON widget_catalog (categoria, is_activo);


-- ===========================================================================
-- DATOS INICIALES
-- ===========================================================================

-- Pantallas del sistema
INSERT IGNORE INTO pantallas (cod_pantalla, descripcion, es_pantalla_plataforma) VALUES
    ('USUARIOS', 'Administración de usuarios y sus accesos', FALSE);

-- Widgets iniciales del dashboard
INSERT IGNORE INTO widget_catalog (widget_key, label, descripcion, categoria, span_default) VALUES
    ('kpiUsuarios', 'Total de Usuarios', 'Cantidad total de usuarios registrados', 'kpi', 3);

COMMIT;
