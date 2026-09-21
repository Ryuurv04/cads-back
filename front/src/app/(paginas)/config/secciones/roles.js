'use client'

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/services/configService';
import BotonAgregar from '@/app/components/botonAgregar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaArrowsRotate } from 'react-icons/fa6';

const MySwal = withReactContent(Swal);

export default function RolesSeccion() {
    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [permisosRol, setPermisosRol] = useState([]);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPermisos, setLoadingPermisos] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const cargarRoles = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await configService.getRoles();
            setRoles(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando roles' });
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarPermisos = useCallback(async () => {
        try {
            const { data } = await configService.getPermisos();
            setPermisos(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando permisos' });
        }
    }, []);

    useEffect(() => {
        cargarRoles();
        cargarPermisos();
    }, [cargarRoles, cargarPermisos]);

    const seleccionarRol = async (rol) => {
        setRolSeleccionado(rol);
        setLoadingPermisos(true);
        try {
            const { data } = await configService.getPermisosRol(rol.cod_rol);
            setPermisosRol(data.data.map(p => p.cod_permiso));
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando permisos del rol' });
        } finally {
            setLoadingPermisos(false);
        }
    };

    const togglePermiso = async (cod_permiso) => {
        if (!rolSeleccionado || guardando) return;
        setGuardando(true);
        const tienePermiso = permisosRol.includes(cod_permiso);
        try {
            if (tienePermiso) {
                await configService.revocarPermiso(rolSeleccionado.cod_rol, cod_permiso);
                setPermisosRol(prev => prev.filter(p => p !== cod_permiso));
            } else {
                await configService.asignarPermiso(rolSeleccionado.cod_rol, cod_permiso);
                setPermisosRol(prev => [...prev, cod_permiso]);
            }
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al actualizar permiso' });
        } finally {
            setGuardando(false);
        }
    };

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda: Roles */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">Roles</h2>
                    <div className="flex gap-2">
                        <button onClick={cargarRoles} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                            <FaArrowsRotate size={13} />
                        </button>
                        <BotonAgregar onClick={abrirFormRol} texto="Nuevo Rol" />
                    </div>
                </div>
                {loading && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {!loading && roles.length === 0 && <p className="text-center text-gray-500 text-sm">No hay roles registrados.</p>}
                <div className="flex flex-col gap-2">
                    {roles.map(rol => (
                        <div key={rol.cod_rol}
                            onClick={() => seleccionarRol(rol)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all
                                ${rolSeleccionado?.cod_rol === rol.cod_rol
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                            <p className="font-medium text-sm">{rol.nombre_rol}</p>
                            {rol.descripcion && <p className="text-xs text-slate-400 mt-0.5">{rol.descripcion}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna derecha: Permisos */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">
                        {rolSeleccionado ? `Permisos — ${rolSeleccionado.nombre_rol}` : 'Permisos'}
                    </h2>
                </div>
                {!rolSeleccionado && (
                    <p className="text-center text-gray-400 text-sm mt-10">Selecciona un rol para gestionar sus permisos</p>
                )}
                {rolSeleccionado && loadingPermisos && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {rolSeleccionado && !loadingPermisos && (
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                        {permisos.map(permiso => (
                            <label key={permiso.cod_permiso}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{permiso.clave}</p>
                                    <p className="text-xs text-slate-400">{permiso.descripcion}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="scale-125"
                                    checked={permisosRol.includes(permiso.cod_permiso)}
                                    onChange={() => togglePermiso(permiso.cod_permiso)}
                                    disabled={guardando}
                                />
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
