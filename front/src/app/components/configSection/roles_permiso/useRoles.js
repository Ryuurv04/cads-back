import { useState, useEffect, useCallback, useMemo } from 'react';
// import { configService } from '@/services/configService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

 const tabs = [
    { cod_rol: 'general', nombre_rol:'General', descripcion:'cog'},
    { cod_rol: 'Empresa', nombre_rol:'empresa', descripcion:'users'},
];

// Datos de prueba: catálogo de pantallas (tabla `pantallas`). Sin agrupar, ya que
// la tabla real no tiene noción de área/grupo, solo cod_pantalla + descripcion.
const MODULESData = [
    { id:'SOLICITUD',            label:'Solicitudes',         ic:'clipboard' },
    { id:'EQUIPOS',              label:'Equipos',             ic:'cube' },
    { id:'SOLICITUDES_REGISTRO', label:'Registro de equipos', ic:'inventory' },
    { id:'USUARIOS',             label:'Usuarios',             ic:'users' },
    { id:'USUARIOS2',             label:'Usuarios',             ic:'users' },
    { id:'USUARIOS3',             label:'Usuarios',             ic:'users' },

    { id:'USUARIOS4',             label:'Usuarios',             ic:'users' },
    { id:'USUARIOS5',             label:'Usuarios',             ic:'users' },
    { id:'USUARIOS6',             label:'Usuarios',             ic:'users' },

    { id:'USUARIOS7',             label:'Usuarios',             ic:'users' },
    { id:'USUARIOS8',             label:'Usuarios',             ic:'users' },

    { id:'ROLES',                label:'Roles y permisos',    ic:'cog' },
];

// Datos de prueba: nivel (0=Sin acceso, 1=Lectura, 2=Edición, 3=Total) por rol y pantalla,
// simulando lo que vendría de la tabla `roles_pantallas` para el rol seleccionado.
const permisosPorRolMock = {
    general: { SOLICITUD: 3, EQUIPOS: 3, SOLICITUDES_REGISTRO: 2, USUARIOS: 1, ROLES: 0 },
    Empresa: { SOLICITUD: 2, EQUIPOS: 1, SOLICITUDES_REGISTRO: 0, USUARIOS: 0, ROLES: 0 },
};

export const useRoles = () => {
    const [roles, setRoles] = useState(tabs);
    const [MODULES, setMODULES] = useState(MODULESData);
    const [perms, setPerms] = useState({});
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPermisos, setLoadingPermisos] = useState(false);

    const cantPermisos = useMemo(() => {
        const contar = (nivel) => MODULES.filter(m => (perms[m.id] ?? 0) === nivel).length;
        return [
            { valor: contar(0), nombre:'Sin acceso', tone:'plum' },            
            { valor: contar(1), nombre:'Lectura',    tone:'amber' },
            { valor: contar(2), nombre:'Edicion',    tone:'cobalt' },
            { valor: contar(3), nombre:'Total',      tone:'sage' },
            
        ];
    }, [perms, MODULES]);

        const cargarRoles = useCallback(async () => {
        setLoading(true);
        try {
            // const { data } = await configService.getRoles();
            // setRoles(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando roles' });
        } finally {
            setLoading(false);
        }
    }, []);
        const cargarPermisos = useCallback(async () => {
        try {
            // const { data } = await configService.getPermisos();
            // setPermisos(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando permisos' });
        }
    }, []);
    useEffect(() => {
        cargarRoles();
        cargarPermisos();
    }, [cargarRoles, cargarPermisos]);

    const seleccionarRol = useCallback(async (rol) => {
        setRolSeleccionado(rol);
        setLoadingPermisos(true);
        try {
            // const { data } = await configService.getPermisosRol(rol.cod_rol);
            // setPerms(data.data);
            setPerms(permisosPorRolMock[rol.cod_rol] || {});
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando permisos del rol' });
        } finally {
            setLoadingPermisos(false);
        }
    }, []);

    useEffect(() => {
        if (!rolSeleccionado && roles.length > 0) {
            seleccionarRol(roles[0]);
        }
    }, [roles, rolSeleccionado, seleccionarRol]);

    const setLevel = useCallback((cod_pantalla, nivel) => {
        // Dato de prueba: actualiza solo el estado local.
        // Cuando exista el endpoint: await configService.actualizarNivelPantalla(rolSeleccionado.cod_rol, cod_pantalla, nivel);
        setPerms(prev => ({ ...prev, [cod_pantalla]: nivel }));
    }, []);

    const abrirFormRol = () => {
        MySwal.fire({
            title: 'Nuevo Rol',
            html: `
                <input id="nombre_rol" class="swal2-input" placeholder="Nombre del rol">
                <input id="descripcion" class="swal2-input" placeholder="Descripción (opcional)">
            `,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nombre_rol = document.getElementById('nombre_rol').value;
                if (!nombre_rol) { Swal.showValidationMessage('El nombre del rol es requerido'); return false; }
                return { nombre_rol, descripcion: document.getElementById('descripcion').value };
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await configService.crearRol(result.value);
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: 'Rol creado correctamente', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                cargarRoles();
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al crear rol' });
            }
        });
    };

    return {
        roles,
        loading,rolSeleccionado,
        MODULES,
        perms,
        seleccionarRol,
        cargarRoles,
        cantPermisos,
        setLevel,
        abrirFormRol
    };
}