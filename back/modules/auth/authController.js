const AuthService = require('./authService');
const { obtenerOpcionesCookieToken } = require('../../helpers/authCookieHelper');


exports.login = (pool) => async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ message: 'Se requiere email y contraseña.' });
        }
        const loginResult = await AuthService.loginUsuario(pool, email, password);

        if (loginResult.requireRoleSelection) {
            return res.json({
                requireRoleSelection: true,
                roles: loginResult.roles,
                cod_usuario: loginResult.cod_usuario
            });
        }

        // El JWT viaja en una cookie HttpOnly — nunca en el cuerpo de la respuesta.
        res.cookie('token', loginResult.token, obtenerOpcionesCookieToken());
        const { token, ...respuesta } = loginResult;
        res.json(respuesta);

    } catch (error) {
        console.error('Error durante el login:', error);
        
        // Si el error fue lanzado por el servicio con un código específico (401, 403)
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Error genérico del servidor (500)
        return res.status(500).json({ message: 'Error del servidor. Intente más tarde.' });
    }
};

exports.getMe = (pool) => async (req, res) => {
    try {
        // Los datos ya vienen del token decodificado por el middleware
        const { cod_usuario, cod_rol } = req.user;
        // valida que el token tenga los datos necesarios
        if (!cod_usuario || !cod_rol) {
            return res.status(400).json({ message: 'Datos de usuario incompletos en el token.' });
        }
        // Recuperamos la información actualizada del usuario (en caso de que haya cambios desde que se emitió el token)
        const data = await AuthService.recuperarUsuario(pool, cod_usuario, cod_rol);
        // Respondemos con los datos del usuario, roles y pantallas
        res.json(data);
    } catch (error) {
        console.error('Error durante la selección de rol:', error);
        
        // Si el error fue lanzado por el servicio con un código específico (401, 403)
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Error genérico del servidor (500)
        return res.status(500).json({ message: 'Error del servidor. Intente más tarde.' });
    }
};

//OBTENER PERMISOS DEL USUARIO (Protegido - Vital para el Frontend)
exports.getPermissions = (pool) => async (req, res) => {
    // El rol ya está disponible en req.user gracias al authMiddleware
    const { cod_rol, rol } = req.user; 
    if (!cod_rol) {
        return res.status(400).json({ message: 'Rol de usuario no encontrado en el token.' });
    }
    try {
        // Consulta: Obtener todos los permisos asociados al rol del usuario
        const permissions = await AuthService.obtenerPermisosRol(pool, cod_rol);
        res.json({
            rol: rol,
            permiso: permissions
        });

    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ message: 'Error interno al consultar permisos.' });
    }
};

exports.logout = () => (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Sesión cerrada.' });
};
