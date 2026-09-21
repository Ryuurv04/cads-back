-- ===========================================================================
-- Migración 001 (UNDO): Rollback del núcleo de autenticación
-- Orden inverso respetando las foreign keys
-- ===========================================================================

DROP TABLE IF EXISTS usuario_rol;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles_pantallas;
DROP TABLE IF EXISTS pantallas;
DROP TABLE IF EXISTS roles;