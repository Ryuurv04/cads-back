CREATE TABLE IF NOT EXISTS cards_profiles (
    cod_profile        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug               VARCHAR(60) UNIQUE NOT NULL,
    nombre             VARCHAR(50) NOT NULL,
    segundo_nombre     VARCHAR(50) NULL,
    apellido           VARCHAR(50) NOT NULL,
    segundo_apellido   VARCHAR(50) NULL,
    empresa            VARCHAR(100) NULL,
    titulo_puesto      VARCHAR(100) NULL,
    telefono           VARCHAR(30) NOT NULL,
    direccion          VARCHAR(255) NULL,
    correo             VARCHAR(100) NULL,
    pagina_web         VARCHAR(255) NULL,
    color_primario     VARCHAR(7) NOT NULL DEFAULT '#1E293B',
    color_secundario   VARCHAR(7) NOT NULL DEFAULT '#0284C7',
    is_activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creado       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;