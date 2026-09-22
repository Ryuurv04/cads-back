-- ===========================================================================
-- Migración 001 (DO): Núcleo de Autenticación y RBAC Básico para Cards
-- ===========================================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    cod_rol     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'PK interna',
    uuid_rol    VARCHAR(36) UNIQUE NOT NULL COMMENT 'Identificador público UUID v4',
    nombre_rol  VARCHAR(50) NOT NULL COMMENT 'Nombre del rol (ej. SuperAdmin, Administrador, Operador)',
    descripcion VARCHAR(255) NULL,
    is_activo   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_rol_nombre (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PANTALLAS / MÓDULOS
CREATE TABLE IF NOT EXISTS pantallas (
    cod_pantalla           VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Clave de módulo (ej. CARDS, USUARIOS, REPORTES)',
    descripcion            VARCHAR(150) NOT NULL,
    es_pantalla_plataforma BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE si es solo para SuperAdmin de la plataforma',
    fecha_creado           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ROLES_PANTALLAS (Matriz de permisos por pantalla)
CREATE TABLE IF NOT EXISTS roles_pantallas (
    cod_rol      BIGINT UNSIGNED NOT NULL,
    cod_pantalla VARCHAR(50) NOT NULL,
    nivel        TINYINT NOT NULL DEFAULT 0 COMMENT '0=Sin acceso, 1=Lectura, 2=Edición, 3=Total',
    PRIMARY KEY (cod_rol, cod_pantalla),
    CONSTRAINT chk_nivel_acceso CHECK (nivel BETWEEN 0 AND 3),
    FOREIGN KEY (cod_rol) REFERENCES roles(cod_rol) ON DELETE CASCADE,
    FOREIGN KEY (cod_pantalla) REFERENCES pantallas(cod_pantalla) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. USUARIOS (Credenciales de inicio de sesión)
CREATE TABLE IF NOT EXISTS usuarios (
    cod_usuario        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'PK interna',
    uuid_usuario       VARCHAR(36) UNIQUE NOT NULL COMMENT 'UUID v4 para tokens y sesiones',
    correo             VARCHAR(100) UNIQUE NOT NULL COMMENT 'Credencial de acceso',
    password           VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
    nombre             VARCHAR(100) NOT NULL,
    apellido           VARCHAR(100) NOT NULL,
    telefono           VARCHAR(30) NULL,
    estado             VARCHAR(1) NOT NULL DEFAULT 'A' COMMENT 'A=Activo, I=Inactivo',
    cod_rol            BIGINT UNSIGNED NOT NULL COMMENT 'Rol principal del usuario',
    reset_token        VARCHAR(255) NULL DEFAULT NULL,
    reset_token_expiry DATETIME NULL DEFAULT NULL,
    fecha_creado       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminado    TIMESTAMP NULL DEFAULT NULL COMMENT 'Borrado lógico',
    CONSTRAINT chk_estado_usuario CHECK (estado IN ('A', 'I')),
    FOREIGN KEY (cod_rol) REFERENCES roles(cod_rol) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ===========================================================================
-- SEED DATA (Datos base para arrancar)
-- ===========================================================================

-- Roles iniciales
INSERT IGNORE INTO roles (cod_rol, uuid_rol, nombre_rol, descripcion) VALUES
    (1, UUID(), 'SuperAdmin', 'Control total de la plataforma de tarjetas y clientes'),
    (2, UUID(), 'ClienteAdmin', 'Administrador de sus propias tarjetas');

-- Pantallas esenciales
INSERT IGNORE INTO pantallas (cod_pantalla, descripcion, es_pantalla_plataforma) VALUES
    ('USUARIOS', 'Gestión de usuarios del sistema', TRUE),
    ('CARDS', 'Gestión y creación de tarjetas NFC y slugs', FALSE);

-- Permisos por defecto para SuperAdmin (Nivel 3 = Total)
INSERT IGNORE INTO roles_pantallas (cod_rol, cod_pantalla, nivel) VALUES
    (1, 'USUARIOS', 3),
    (1, 'CARDS', 3);

    INSERT IGNORE INTO usuarios (
    cod_usuario,
    uuid_usuario,
    correo,
    password,
    nombre,
    apellido,
    telefono,
    estado,
    cod_rol
) VALUES (
    1,
    UUID(),
    'admin@cards.com',
    '$2y$10$eavlNvUw7FaQqIAqTotDOOv2QK5Cayq.YacbPnHR74CmBCuFFLNoW', -- Hash de 'Password123!'
    'Admin',
    'Sistema',
    '+50700000000',
    'A',
    1
);

