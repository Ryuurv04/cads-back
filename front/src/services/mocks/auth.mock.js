// Directorio de cuentas de prueba. Simula lo que el backend validaría contra la tabla `usuarios`.
export const MOCK_PANTALLAS_POR_ROL = {
    Administrador: ['SOLICITUD', 'EQUIPOS', 'SOLICITUDES_REGISTRO', 'ROLES', 'USUARIOS'],
    Técnico: ['EQUIPOS'],
    Supervisor: ['SOLICITUD', 'EQUIPOS'],
};

export const MOCK_CUENTAS = [
    {
        email: 'innvix@innvix.com',
        password: '1234',
        user: {
            cod_usuario: 1,
            uuid_usuario: 'uuid-usr-0001',
            nombre: 'Ana Pérez',
            correo: 'innvix@innvix.com',
            cod_rol: 1,
            rol: 'Administrador',
        },
    },
    {
        email: 'colaborador@innvix.com',
        password: '1234',
        user: {
            cod_usuario: 2,
            uuid_usuario: 'uuid-usr-0002',
            nombre: 'Luis Gómez',
            correo: 'colaborador@innvix.com',
            cod_rol: 2,
            rol: 'Técnico',
        },
    },
];

// Cuenta que dispara el flujo de selección de rol (usuario con más de un rol asignado).
export const MOCK_CUENTA_MULTIROL = {
    email: 'multirol@innvix.com',
    password: '1234',
    cod_usuario: 3,
    roles: [
        { cod_rol: 1, nombre_rol: 'Administrador' },
        { cod_rol: 3, nombre_rol: 'Supervisor' },
    ],
    usuarioPorRol: {
        1: {
            cod_usuario: 3,
            uuid_usuario: 'uuid-usr-0003',
            nombre: 'María Rodríguez',
            correo: 'multirol@innvix.com',
            cod_rol: 1,
            rol: 'Administrador',
        },
        3: {
            cod_usuario: 3,
            uuid_usuario: 'uuid-usr-0003',
            nombre: 'María Rodríguez',
            correo: 'multirol@innvix.com',
            cod_rol: 3,
            rol: 'Supervisor',
        },
    },
};
