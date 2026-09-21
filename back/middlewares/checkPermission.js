// /backend/middleware/rbac.js

/**
 * Genera un middleware que verifica si el usuario autenticado tiene un permiso específico.
 * @param {object} pool - Pool de conexiones a la base de datos.
 * @param {string} permisoRequerido - Clave del permiso a verificar (Ej: 'VER_PRODUCTOS').
 * @returns {function} Middleware de Express.
 */
const checkPermission = (pool, permisoRequerido) => {
    return async (req, res, next) => {
        const { rol } = req.user;
        try {
            // Obtiene todos los permisos del rol en una sola consulta
            const query = `
                SELECT p.clave
                FROM roles r
                JOIN roles_permisos rp ON r.cod_rol = rp.cod_rol
                JOIN permisos p ON rp.cod_permiso = p.cod_permiso
                WHERE r.nombre_rol = ?
            `;
            const [rows] = await pool.query(query, [rol]);
            const permisos = rows.map(r => r.clave);

            // Adjunta todos los permisos al request para uso en controllers
            req.user.permisos = permisos;

            // Soporta string (un permiso) o array (cualquiera de los permisos)
            const tieneAcceso = Array.isArray(permisoRequerido)
                ? permisoRequerido.some(p => permisos.includes(p))
                : permisos.includes(permisoRequerido);

            if (tieneAcceso) {
                next();
            } else {
                res.status(403).json({ message: 'Acceso prohibido. Permiso insuficiente.' });
            }
        } catch (error) {
            console.error('Error en middleware RBAC:', error);
            res.status(500).json({ message: 'Error interno de autorización.' });
        }
    };
};

// Verifica que el rol del usuario tenga al menos nivelMinimo en la pantalla indicada.
// 0=sin acceso  1=lectura  2=edición  3=total
const checkNivel = (pool, pantallaClave, nivelMinimo) => {
    return async (req, res, next) => {
        const { cod_rol } = req.usuario;
        try {
            const [rows] = await pool.query(
                `SELECT nivel FROM roles_pantallas
                 WHERE cod_rol = ? AND cod_pantalla = ?`,
                [cod_rol, pantallaClave]
            );
            const nivel = rows[0]?.nivel ?? 0;

            if (nivel >= nivelMinimo) {
                next();
            } else {
                res.status(403).json({ message: 'Acceso prohibido. Nivel de acceso insuficiente.' });
            }
        } catch (error) {
            console.error('Error en middleware checkNivel:', error);
            res.status(500).json({ message: 'Error interno de autorización.' });
        }
    };
};

module.exports = { checkPermission, checkNivel };