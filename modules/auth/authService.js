const AuthModel = require('./authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Se asume que tienes JWT_SECRET en tu archivo .env
const JWT_SECRET = process.env.JWT_SECRET; 
const SALT_ROUNDS = 10;

const loginUsuario = async (pool, email, password) => {
    // 1. Buscamos el usuario por email
    const usuario = await AuthModel.buscarUsuarioPorEmail(pool, email);
    // 2. Si no existe o no está activo, lanzamos un error de credenciales inválidas
    
    if (!usuario) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401; 
        throw error;
    }
    // 3. Comparamos la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(password, usuario.password);

    if (!isMatch) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401; 
        throw error;
    }
    // 4. Si el usuario tiene múltiples roles, se maneja esa lógica en el controlador (no aquí)
    const roles = await AuthModel.buscarRolesPorUsuario(pool, usuario.cod_usuario);

    if (roles.length === 0) {
        const error = new Error('Usuario sin roles asignados.');
        error.statusCode = 403;
        throw error;
    }
    if (roles.length > 1) {
        return {
            requireRoleSelection: true,            
            roles: roles,
            cod_usuario: usuario.cod_usuario
        };
    }
    // 5. buscamos las pantallas asociadas al rol del usuario
    const pantallas = await AuthModel.obtenerPantallasRol(pool, roles[0].cod_rol);


    const payload = {
        cod_usuario: usuario.cod_usuario,
        telefono: usuario.telefono,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        cod_rol: roles[0].cod_rol,
        rol: roles[0].nombre_rol,
        pantallas 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return{
        token,
        message: 'Login exitoso',
        requireRoleSelection: false ,
        user: {
            cod_usuario: usuario.cod_usuario,
            telefono: usuario.telefono,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            cod_rol: roles[0].cod_rol,
            rol: roles[0].nombre_rol
        },
        pantallas
    };
};


const obtenerDatosUsuarioAutenticado = async (pool, cod_usuario, cod_rol) => {

    const usuario = await AuthModel.buscarUsuarioPorRol(pool, cod_usuario, cod_rol);

    if (!usuario) {
        const error = new Error('Rol no autorizado para este usuario.');
        error.statusCode = 403;
        throw error;
    }

    return usuario;

};

const recuperarUsuario = async (pool, cod_usuario,cod_rol) => {

    const usuario = await AuthModel.buscarUsuarioPorRol(pool, cod_usuario, cod_rol);
    
    if (!usuario) {
        const error = new Error('Rol no autorizado para este usuario.');
        error.statusCode = 403;
        throw error;
    }

    const payload = {
        cod_usuario: usuario.cod_usuario,
        telefono: usuario.telefono,
        cod_rol: usuario.cod_rol,
        rol: usuario.nombre_rol
    };

    return{
        user: payload,
        message: `Accediendo como ${usuario.nombre_rol}`
    };
};

const obtenerPermisosRol = async (pool, cod_rol) => {
    const data = await AuthModel.obtenerPermisosRol(pool, cod_rol);
    const permisos = data.map(row => row.clave);

    return  permisos ;
};

module.exports = {
    loginUsuario,
    obtenerDatosUsuarioAutenticado,
    recuperarUsuario,
    obtenerPermisosRol
};