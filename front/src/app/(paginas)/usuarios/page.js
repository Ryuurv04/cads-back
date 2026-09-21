'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaArrowsRotate } from 'react-icons/fa6';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { MdOutlineClear, MdFilterList } from 'react-icons/md';
import BotonAgregar from '@/app/components/botonAgregar';
import Paginacion from '@/app/components/imputs/paginacion';
import { Tabla } from './funcionesUsuario';
import { usuarioServices } from '@/services/usuarioServices';

const MySwal = withReactContent(Swal);

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [limite] = useState(6);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [roles, setRoles] = useState([]);
    const [subAreas, setSubAreas] = useState([]);
    const [filtros, setFiltros] = useState({ nombre: '', cod_subarea: '', estado: '' });
    const [filtrosLocales, setFiltrosLocales] = useState({ nombre: '', cod_subarea: '', estado: '' });
    const userData = JSON.parse(localStorage.getItem('user'));

    const cargarCatalogos = useCallback(async () => {
        try {
            const [resRoles, resSubAreas] = await Promise.all([
                usuarioServices.getRoles(),
                usuarioServices.getSubAreas(),
            ]);
            setRoles(resRoles.data.data);
            setSubAreas(resSubAreas.data.data);
        } catch (e) {
            console.error('Error cargando catálogos', e);
        }
    }, []);

    const buscarUsuarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await usuarioServices.getUsuarios({
                pag: pagina,
                limite,
                nombre: filtros.nombre,
                cod_subarea: filtros.cod_subarea,
                estado: filtros.estado,
            });
            setUsuarios(res.data.data);
            setTotalPaginas(res.data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    }, [pagina, limite, filtros]);

    useEffect(() => {
        cargarCatalogos();
    }, [cargarCatalogos]);

    useEffect(() => {
        buscarUsuarios();
    }, [buscarUsuarios]);

    // ---------- helpers de formulario ----------
    const construirFormHTML = (rolesDisponibles, subAreasDisponibles, usuario = null) => {        
        const rolesSeleccionados = usuario?.roles
            ? usuario.roles.split(', ')
            : [];

        const opcionesSubArea = subAreasDisponibles
            .map(sa => `<option value="${sa.cod_subarea}" ${usuario?.cod_subarea == sa.cod_subarea ? 'selected' : ''}>${sa.descripcion}</option>`)
            .join('');

        const checkboxesRoles = rolesDisponibles
            .map(r => `
                <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:14px;">
                    <input type="checkbox" name="rol" value="${r.cod_rol}"
                        ${rolesSeleccionados.includes(r.nombre_rol) ? 'checked' : ''}
                        style="width:16px;height:16px;">
                    ${r.nombre_rol}
                </label>`)
            .join('');

        const campoPassword = usuario ? '' : `
            <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña inicial" style="margin:4px 0;">
        `;

        return `
            <div style="text-align:left;display:flex;flex-direction:column;gap:4px;">
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${usuario?.nombre?.split(' ')[0] || ''}" style="margin:4px 0;">
                <input id="swal-apellido" class="swal2-input" placeholder="Apellido" value="${usuario?.nombre?.split(' ').slice(1).join(' ') || ''}" style="margin:4px 0;">
                <input id="swal-num_empleado" class="swal2-input" placeholder="N° Empleado" type="text" value="${usuario?.num_empleado || ''}" style="margin:4px 0;">
                <input id="swal-correo" class="swal2-input" placeholder="Correo" type="email" value="${usuario?.correo || ''}" style="margin:4px 0;">
                ${campoPassword}
                <select id="swal-subarea" class="swal2-input" style="margin:4px 0;">
                    <option value="">Selecciona subárea</option>
                    ${opcionesSubArea}
                </select>
                <div style="margin-top:8px;">
                    <p style="font-size:13px;font-weight:600;color:#555;margin-bottom:4px;">Roles:</p>
                    <div style="max-height:120px;overflow-y:auto;border:1px solid #d1d5db;border-radius:6px;padding:8px;">
                        ${checkboxesRoles}
                    </div>
                </div>
            </div>
        `;
    };

    const leerFormulario = (esEdicion = false) => {
        const checkboxes = document.querySelectorAll('input[name="rol"]:checked');
        const roles = Array.from(checkboxes).map(cb => parseInt(cb.value));
        const data = {
            nombre: document.getElementById('swal-nombre')?.value?.trim(),
            apellido: document.getElementById('swal-apellido')?.value?.trim(),
            num_empleado: document.getElementById('swal-num_empleado')?.value?.trim(),
            correo: document.getElementById('swal-correo')?.value?.trim(),
            cod_subarea: document.getElementById('swal-subarea')?.value,
            roles,
        };
        if (!esEdicion) {
            data.password = document.getElementById('swal-password')?.value?.trim();
        }
        return data;
    };

    const validarForm = (data, esEdicion = false) => {
        if (!data.nombre) return 'El nombre es obligatorio.';
        if (!data.apellido) return 'El apellido es obligatorio.';
        if (!data.num_empleado) return 'El N° de empleado es obligatorio.';
        if (!data.correo) return 'El correo es obligatorio.';
        if (!esEdicion && !data.password) return 'La contraseña es obligatoria.';
        if (!data.cod_subarea) return 'Selecciona una subárea.';
        if (data.roles.length === 0) return 'Selecciona al menos un rol.';
        return null;
    };

    // ---------- Crear usuario ----------
    const abrirFormCrear = () => {
        MySwal.fire({
            title: 'Nuevo Usuario',
            html: construirFormHTML(roles, subAreas),
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0078d4',
            preConfirm: () => {
                const data = leerFormulario(false);
                const error = validarForm(data, false);
                if (error) { Swal.showValidationMessage(error); return false; }
                return data;
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await usuarioServices.crearUsuario(result.value);
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: 'Usuario creado correctamente.', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                buscarUsuarios();
            } catch (err) {
                MySwal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al crear el usuario.' });
            }
        });
    };

    // ---------- Editar usuario ----------
    const abrirFormEditar = (usuario) => {
        MySwal.fire({
            title: 'Editar Usuario',
            html: construirFormHTML(roles, subAreas, usuario),
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0078d4',
            preConfirm: () => {
                const data = leerFormulario(true);
                const error = validarForm(data, true);
                if (error) { Swal.showValidationMessage(error); return false; }
                return data;
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await usuarioServices.editarUsuario(usuario.cod_usuario, result.value);
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: 'Usuario actualizado correctamente.', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                buscarUsuarios();
            } catch (err) {
                MySwal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al actualizar el usuario.' });
            }
        });
    };

    // ---------- Activar / Deshabilitar ----------
    const handleToggleEstado = async (cod_usuario, estadoActual) => {
        const accion = estadoActual === 'A' ? 'deshabilitar' : 'activar';
        const { isConfirmed } = await MySwal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
            text: estadoActual === 'A' ? 'No podrá iniciar sesión mientras esté deshabilitado.' : 'El usuario podrá volver a iniciar sesión.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: estadoActual === 'A' ? '#dc3545' : '#28a745',
        });
        if (!isConfirmed) return;
        try {
            const res = await usuarioServices.toggleEstado(cod_usuario);
            MySwal.fire({ icon: 'success', title: '¡Éxito!', text: res.data.message, timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            buscarUsuarios();
        } catch (err) {
            MySwal.fire({ icon: 'error', title: 'No se puede deshabilitar', text: err.response?.data?.message || 'Error al cambiar el estado.' });
        }
    };

    // ---------- Filtros ----------
    const aplicarFiltros = () => {
        setPagina(1);
        setFiltros(filtrosLocales);
    };
    const limpiarFiltros = () => {
        const vacio = { nombre: '', cod_subarea: '', estado: '' };
        setFiltrosLocales(vacio);
        setFiltros(vacio);
        setPagina(1);
    };

    // ---------- Reset contraseña ----------
    const handleResetPassword = async (cod_usuario) => {
        const { isConfirmed } = await MySwal.fire({
            title: '¿Enviar reset de contraseña?',
            text: 'Se enviará un correo al usuario con un enlace para cambiar su contraseña. El enlace expira en 2 horas.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0078d4',
        });
        if (!isConfirmed) return;
        try {
            const res = await usuarioServices.enviarResetPassword(cod_usuario);
            MySwal.fire({ icon: 'success', title: '¡Enviado!', text: res.data.message, timer: 3000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
        } catch (err) {
            MySwal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al enviar el correo.' });
        }
    };

    return (
        <div className="p-6">
            {/* Parte Superior */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-100">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
                        <p className="text-slate-500 text-sm">Gestión de usuarios del sistema</p>
                    </div>
                </div>
                <div className='md:mb-0 mb-4'>
                    <BotonAgregar texto='Nuevo Usuario' onClick={abrirFormCrear} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-hidden md:overflow-x-auto">
                {/* Panel de Búsqueda */}
                <div className="pb-4 mb-4">
                    <div className="flex items-center gap-2 mb-4 text-slate-600 font-bold text-xs uppercase tracking-widest">
                        <MdFilterList size={18} className="text-blue-500" />
                        <span>Panel de Búsqueda</span>
                        <button onClick={buscarUsuarios} title='Actualizar'
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                            <FaArrowsRotate />
                        </button>
                        <div className="ml-auto flex gap-2">
                            <button onClick={aplicarFiltros}
                                className="bg-[var(--bg-principal)] text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[var(--principal-hover)] transition-all shadow-sm active:scale-95">
                                <FaSearch size={12} /> Buscar
                            </button>
                            <button onClick={limpiarFiltros}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <MdOutlineClear size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nombre / N° Empleado</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o número..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                value={filtrosLocales.nombre}
                                onChange={(e) => setFiltrosLocales(prev => ({ ...prev, nombre: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Subárea</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                value={filtrosLocales.cod_subarea}
                                onChange={(e) => setFiltrosLocales(prev => ({ ...prev, cod_subarea: e.target.value }))}
                            >
                                <option value="">Todas las subáreas</option>
                                {subAreas.map(sa => (
                                    <option key={sa.cod_subarea} value={sa.cod_subarea}>{sa.descripcion}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Estado</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                value={filtrosLocales.estado}
                                onChange={(e) => setFiltrosLocales(prev => ({ ...prev, estado: e.target.value }))}
                            >
                                <option value="">Todos</option>
                                <option value="A">Activo</option>
                                <option value="I">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && <p className="text-center text-[var(--bg-principal)]">Cargando usuarios...</p>}
                {error && <p className="text-center text-red-600">Error: {error}</p>}
                {!loading && !error && usuarios.length === 0 && (
                    <p className="text-center text-gray-500">No se encontraron usuarios.</p>
                )}
                {!loading && !error && usuarios.length > 0 && (
                    <Tabla
                        data={usuarios}
                        onClickEstado={handleToggleEstado}
                        onClickEditar={abrirFormEditar}
                        onClickReset={handleResetPassword}
                        usuarioActual={userData}
                    />
                )}
                <Paginacion
                    pagina={pagina}
                    totalPaginas={totalPaginas}
                    onPaginaCambio={setPagina}
                />
            </div>
        </div>
    );
}
