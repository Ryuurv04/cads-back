'use client'

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/services/configService';
import SubAreaSelect from '@/app/components/imputs/subArea';
import BotonAgregar from '@/app/components/botonAgregar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEdit } from 'react-icons/fa';
import { FaArrowsRotate } from 'react-icons/fa6';

const MySwal = withReactContent(Swal);

const FORM_INICIAL = { nombre_lugar: '', cod_subarea: '' };

export default function UbicacionesSeccion() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [ubicacionEditando, setUbicacionEditando] = useState(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [guardando, setGuardando] = useState(false);

    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await configService.getUbicaciones();
            setUbicaciones(data.data);
        } catch {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando ubicaciones' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]);

    const abrirModal = (ubicacion = null) => {
        setUbicacionEditando(ubicacion);
        setForm(ubicacion
            ? { nombre_lugar: ubicacion.nombre_lugar, cod_subarea: ubicacion.cod_subarea }
            : FORM_INICIAL
        );
        setModalAbierto(true);
    };

    const cerrarModal = () => { setModalAbierto(false); setUbicacionEditando(null); };

    const guardar = async () => {
        if (!form.nombre_lugar || !form.cod_subarea) {
            MySwal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa nombre y sub-área' });
            return;
        }
        setGuardando(true);
        try {
            if (ubicacionEditando) {
                await configService.editarUbicacion({ cod_ubicacion: ubicacionEditando.cod_ubicacion, ...form });
            } else {
                await configService.crearUbicacion(form);
            }
            MySwal.fire({ icon: 'success', title: '¡Éxito!', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            cerrarModal();
            cargarUbicaciones();
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
        } finally {
            setGuardando(false);
        }
    };

    const toggleEstado = async (ubicacion) => {
        const accion = ubicacion.estado === 'A' ? 'desactivar' : 'activar';
        const confirm = await MySwal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} ubicación?`,
            text: `"${ubicacion.nombre_lugar}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;
        try {
            await configService.toggleEstadoUbicacion(ubicacion.cod_ubicacion);
            MySwal.fire({ icon: 'success', title: '¡Actualizado!', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            cargarUbicaciones();
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al actualizar' });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">Ubicaciones</h2>
                <div className="flex gap-2">
                    <button onClick={cargarUbicaciones} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                        <FaArrowsRotate size={13} />
                    </button>
                    <BotonAgregar onClick={() => abrirModal()} texto="Nueva Ubicación" />
                </div>
            </div>

            {loading && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
            {!loading && ubicaciones.length === 0 && <p className="text-center text-gray-500 text-sm">No se encontraron ubicaciones.</p>}

            {!loading && ubicaciones.length > 0 && (
                <div className="overflow-x-hidden md:overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Área</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="pb-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ubicaciones.map(ubicacion => (
                                <tr key={ubicacion.cod_ubicacion} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                    <td className="py-3 font-medium text-slate-700">{ubicacion.nombre_lugar}</td>
                                    <td className="py-3 text-slate-500">{ubicacion.sub_area}</td>
                                    <td className="py-3">
                                        <button onClick={() => toggleEstado(ubicacion)}
                                            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors
                                                ${ubicacion.estado === 'A'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                            {ubicacion.estado === 'A' ? 'Activa' : 'Inactiva'}
                                        </button>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => abrirModal(ubicacion)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                                <FaEdit size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-slate-800 font-bold text-base mb-4">
                            {ubicacionEditando ? 'Editar Ubicación' : 'Nueva Ubicación'}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Nombre del lugar *"
                                value={form.nombre_lugar}
                                onChange={(e) => setForm(f => ({ ...f, nombre_lugar: e.target.value }))}
                                className="px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                            />
                            <SubAreaSelect
                                selectedSubArea={form.cod_subarea}
                                onSelectSubArea={(val) => setForm(f => ({ ...f, cod_subarea: val }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={cerrarModal}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={guardar} disabled={guardando}
                                className="px-4 py-2 rounded-xl bg-[var(--bg-principal)] text-white text-sm hover:bg-[var(--principal-hover)] transition-colors disabled:opacity-50">
                                {guardando ? 'Guardando...' : ubicacionEditando ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
