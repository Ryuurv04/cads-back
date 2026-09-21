/**
 * Obtiene el perfil detallado del usuario con su negocio, plan y rol
 * @param {Object} pool - Conexión a la base de datos
 * @param {number} codUsuario - Código del usuario a buscar
 * @param {string} email - Correo electrónico del usuario a buscar
 * @returns {Object|null} Retorna los datos del usuario o null si no existe
 */

const  buscarUsuarioPorEmail = async (pool, email) => {
     const [rows] = await pool.execute(
      ` SELECT u.cod_usuario, u.nombre_empresa, u.direccion,u.telefono, u.password
            FROM usuarios u
            WHERE u.correo = ? AND u.estado = 'A'`,
      [email]
    );
    return rows[0] || null;
};


const  buscarRolesPorUsuario = async (pool, codUsuario) => {
    const [rows] = await pool.execute(
    `SELECT  r.cod_rol, r.nombre_rol 
            FROM roles r
            INNER JOIN usuarios u ON r.cod_rol = u.cod_rol
            WHERE u.cod_usuario = ?`,
    [codUsuario]
    );
    return rows || [];
};

const  buscarUsuarioPorRol = async (pool, codUsuario, codRol) => {
    const [rows] = await pool.execute(
    `SELECT u.cod_usuario, u.nombre_empresa,u.direccion,u.telefono, r.nombre_rol,r.cod_rol
            FROM usuarios u
            INNER JOIN roles r ON u.cod_rol = r.cod_rol
            WHERE u.cod_usuario = ? AND r.cod_rol = ? AND u.estado = 'A'`,
    [codUsuario, codRol]
    );
    return rows[0] || null;
};


/**
 * Obtiene las claves de pantalla a las que un rol tiene algún nivel de acceso.
 * @param {Object} pool - Conexión a la base de datos
 * @param {string} codRol - cod_rol del rol a consultar
 * @returns {Array} Filas con { clave } — cod_pantalla de cada pantalla accesible (nivel > 0)
 */
const obtenerPantallasRol = async (pool, codRol) => {
     const [rows] = await pool.execute(
        `SELECT rp.cod_pantalla AS clave
            FROM roles_pantallas rp
            WHERE rp.cod_rol = ? AND rp.nivel > 0`,
        [codRol]
    );
    return rows.map(row => row.clave) || null;
};

module.exports = {
    buscarUsuarioPorEmail,
    buscarRolesPorUsuario,
    buscarUsuarioPorRol,
    obtenerPantallasRol
};