export const MOCK_SUBAREAS = [
    { cod_subarea: 1, descripcion: 'Tecnología' },
    { cod_subarea: 2, descripcion: 'Recursos Humanos' },
    { cod_subarea: 3, descripcion: 'Almacén' },
];

export const MOCK_ROLES = [
    { cod_rol: 1, nombre_rol: 'Administrador' },
    { cod_rol: 2, nombre_rol: 'Técnico' },
    { cod_rol: 3, nombre_rol: 'Supervisor' },
];

export const MOCK_USUARIOS = [
    { cod_usuario: 1, nombre: 'Ana Pérez', num_empleado: '00123', correo: 'ana.perez@cenamep.org.pa', nom_subarea: 'Tecnología', cod_subarea: 1, roles: 'Administrador', estado: 'A' },
    { cod_usuario: 2, nombre: 'Luis Gómez', num_empleado: '00456', correo: 'luis.gomez@cenamep.org.pa', nom_subarea: 'Almacén', cod_subarea: 3, roles: 'Técnico', estado: 'A' },
    { cod_usuario: 3, nombre: 'María Rodríguez', num_empleado: '00789', correo: 'maria.rodriguez@cenamep.org.pa', nom_subarea: 'Recursos Humanos', cod_subarea: 2, roles: 'Supervisor, Técnico', estado: 'I' },
    { cod_usuario: 4, nombre: 'Carlos Solís', num_empleado: '00987', correo: 'carlos.solis@cenamep.org.pa', nom_subarea: 'Tecnología', cod_subarea: 1, roles: 'Técnico', estado: 'A' },
];

export const filtrarUsuariosMock = ({ pag = 1, limite = 6, nombre = '', cod_subarea = '', estado = '' }) => {
    const filtrados = MOCK_USUARIOS.filter((u) => {
        const coincideNombre = !nombre || u.nombre.toLowerCase().includes(nombre.toLowerCase()) || u.num_empleado.includes(nombre);
        const coincideSubarea = !cod_subarea || String(u.cod_subarea) === String(cod_subarea);
        const coincideEstado = !estado || u.estado === estado;
        return coincideNombre && coincideSubarea && coincideEstado;
    });

    const totalPages = Math.max(1, Math.ceil(filtrados.length / limite));
    const inicio = (pag - 1) * limite;
    const data = filtrados.slice(inicio, inicio + limite);

    return { data, totalPages };
};
