'use client'

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/services/configService';
import BotonAgregar from '@/app/components/botonAgregar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { FaArrowsRotate } from 'react-icons/fa6';

const MySwal = withReactContent(Swal);

export default function TipoEquipoSeccion() {
    const [tipos, setTipos] = useState([]);
    const [especificaciones, setEspecificaciones] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingEspec, setLoadingEspec] = useState(false);

    const cargarTipos = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await configService.getTipoEquipos();
            setTipos(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando tipos de equipo' });
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarEspecificaciones = useCallback(async (cod_tipo_equipo) => {
        setLoadingEspec(true);
        try {
            const { data } = await configService.getEspecificaciones(cod_tipo_equipo);
            setEspecificaciones(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando especificaciones' });
        } finally {
            setLoadingEspec(false);
        }
    }, []);

    useEffect(() => { cargarTipos(); }, [cargarTipos]);

    const seleccionarTipo = (tipo) => {
        setTipoSeleccionado(tipo);
        cargarEspecificaciones(tipo.cod_tipoequipo);
    };

    const abrirFormTipo = (tipo = null) => {
        MySwal.fire({
            title: tipo ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo',
            input: 'text',
            inputLabel: 'Descripción',
            inputValue: tipo?.tipoequipo || '',
            inputPlaceholder: 'Ej: Laptop, Monitor...',
            showCancelButton: true,
            confirmButtonText: tipo ? 'Guardar' : 'Crear',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value) return 'La descripción es requerida' }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                if (tipo) {
                    await configService.editarTipoEquipo({ cod_tipo_equipo: tipo.cod_tipoequipo, descripcion: result.value });
                } else {
                    await configService.crearTipoEquipo({ descripcion: result.value });
                }
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: tipo ? 'Tipo actualizado' : 'Tipo creado', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                cargarTipos();
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
            }
        });
    };

    const agregarEspecificacion = async () => {
        const result = await MySwal.fire({
            title: 'Nueva Especificación',
            input: 'text',
            inputLabel: 'Descripción',
            inputPlaceholder: 'Ej: Marca, Modelo, RAM...',
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value) return 'La descripción es requerida' }
        });
        if (!result.isConfirmed) return;
        try {
            await configService.crearEspecificacion({ cod_tipo_equipo: tipoSeleccionado.cod_tipoequipo, descripcion: result.value });
            MySwal.fire({ icon: 'success', title: '¡Éxito!', text: 'Especificación agregada', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            cargarEspecificaciones(tipoSeleccionado.cod_tipoequipo);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al agregar' });
        }
    };

    const eliminarEspecificacion = async (cod_especificacion) => {
        const confirm = await MySwal.fire({
            title: '¿Eliminar especificación?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });
        if (!confirm.isConfirmed) return;
        try {
            await configService.deleteEspecificacion(cod_especificacion);
            MySwal.fire({ icon: 'success', title: '¡Eliminado!', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            cargarEspecificaciones(tipoSeleccionado.cod_tipoequipo);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al eliminar' });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda: Tipos */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">Tipos de Equipo</h2>
                    <div className="flex gap-2">
                        <button onClick={cargarTipos} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                            <FaArrowsRotate size={13} />
                        </button>
                        <BotonAgregar onClick={() => abrirFormTipo()} texto="Nuevo Tipo" />
                    </div>
                </div>
                {loading && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {!loading && tipos.length === 0 && <p className="text-center text-gray-500 text-sm">No hay tipos registrados.</p>}
                <div className="flex flex-col gap-2">
                    {tipos.map(tipo => (
                        <div key={tipo.cod_tipoequipo}
                            onClick={() => seleccionarTipo(tipo)}
                            className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all
                                ${tipoSeleccionado?.cod_tipoequipo === tipo.cod_tipoequipo
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                            <span className="font-medium text-sm">{tipo.tipoequipo}</span>
                            <button onClick={(e) => { e.stopPropagation(); abrirFormTipo(tipo); }}
                                className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                <FaEdit size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna derecha: Especificaciones */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">
                        {tipoSeleccionado ? `Especificaciones — ${tipoSeleccionado.tipoequipo}` : 'Especificaciones'}
                    </h2>
                    {tipoSeleccionado && (
                        <button onClick={agregarEspecificacion}
                            className="flex items-center gap-1 bg-[var(--bg-principal)] text-white px-3 py-2 rounded-lg text-sm hover:bg-[var(--principal-hover)] transition-all">
                            <FaPlus size={11} /> Agregar
                        </button>
                    )}
                </div>
                {!tipoSeleccionado && (
                    <p className="text-center text-gray-400 text-sm mt-10">Selecciona un tipo de equipo para ver sus especificaciones</p>
                )}
                {tipoSeleccionado && loadingEspec && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {tipoSeleccionado && !loadingEspec && especificaciones.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">No hay especificaciones para este tipo.</p>
                )}
                <div className="flex flex-col gap-2">
                    {especificaciones.map(espec => (
                        <div key={espec.cod_especificacion}
                            className="flex justify-between items-center p-3 rounded-xl border border-slate-200">
                            <span className="text-sm text-slate-700">{espec.nombre}</span>
                            <button onClick={() => eliminarEspecificacion(espec.cod_especificacion)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                <FaTrash size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
