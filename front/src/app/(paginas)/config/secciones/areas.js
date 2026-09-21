'use client'

import { useState, useEffect, useCallback } from 'react';
import { areasService } from '@/services/areasService';
import BotonAgregar from '@/app/components/botonAgregar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { FaArrowsRotate } from 'react-icons/fa6';

const MySwal = withReactContent(Swal);

export default function AreasSeccion() {
    const [areas, setAreas] = useState([]);
    const [subAreas, setSubAreas] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSubAreas, setLoadingSubAreas] = useState(false);

    const cargarAreas = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await areasService.getAreas();
            setAreas(data.data);
        } catch {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando áreas' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargarAreas(); }, [cargarAreas]);

    const seleccionarArea = async (area) => {
        setAreaSeleccionada(area);
        setLoadingSubAreas(true);
        try {
            const { data } = await areasService.getSubAreasPorArea(area.cod_area);
            setSubAreas(data.data);
        } catch {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando sub-áreas' });
        } finally {
            setLoadingSubAreas(false);
        }
    };

    const abrirFormArea = (area = null) => {
        MySwal.fire({
            title: area ? 'Editar Área' : 'Nueva Área',
            input: 'text',
            inputLabel: 'Descripción',
            inputValue: area?.descripcion || '',
            inputPlaceholder: 'Ej: ADM, TEC, QMS...',
            showCancelButton: true,
            confirmButtonText: area ? 'Guardar' : 'Crear',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value) return 'La descripción es requerida' }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                if (area) {
                    await areasService.editarArea({ cod_area: area.cod_area, descripcion: result.value });
                } else {
                    await areasService.crearArea({ descripcion: result.value });
                }
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: area ? 'Área actualizada' : 'Área creada', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                cargarAreas();
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
            }
        });
    };

    const abrirFormSubArea = (subArea = null) => {
        MySwal.fire({
            title: subArea ? 'Editar Sub-Área' : 'Nueva Sub-Área',
            input: 'text',
            inputLabel: 'Descripción',
            inputValue: subArea?.descripcion || '',
            inputPlaceholder: 'Ej: SDA, Coordinador MM...',
            showCancelButton: true,
            confirmButtonText: subArea ? 'Guardar' : 'Agregar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value) return 'La descripción es requerida' }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                if (subArea) {
                    await areasService.editarSubArea({ cod_subarea: subArea.cod_subarea, descripcion: result.value });
                } else {
                    await areasService.crearSubArea({ cod_area: areaSeleccionada.cod_area, descripcion: result.value });
                }
                MySwal.fire({ icon: 'success', title: '¡Éxito!', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                seleccionarArea(areaSeleccionada);
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda: Áreas */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">Áreas</h2>
                    <div className="flex gap-2">
                        <button onClick={cargarAreas} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                            <FaArrowsRotate size={13} />
                        </button>
                        <BotonAgregar onClick={() => abrirFormArea()} texto="Nueva Área" />
                    </div>
                </div>
                {loading && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {!loading && areas.length === 0 && <p className="text-center text-gray-500 text-sm">No hay áreas registradas.</p>}
                <div className="flex flex-col gap-2">
                    {areas.map(area => (
                        <div key={area.cod_area}
                            onClick={() => seleccionarArea(area)}
                            className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all
                                ${areaSeleccionada?.cod_area === area.cod_area
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                            <span className="font-medium text-sm">{area.descripcion}</span>
                            <button onClick={(e) => { e.stopPropagation(); abrirFormArea(area); }}
                                className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                <FaEdit size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna derecha: Sub-Áreas */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">
                        {areaSeleccionada ? `Sub-Áreas — ${areaSeleccionada.descripcion}` : 'Sub-Áreas'}
                    </h2>
                    {areaSeleccionada && (
                        <button onClick={() => abrirFormSubArea()}
                            className="flex items-center gap-1 bg-[var(--bg-principal)] text-white px-3 py-2 rounded-lg text-sm hover:bg-[var(--principal-hover)] transition-all">
                            <FaPlus size={11} /> Agregar
                        </button>
                    )}
                </div>
                {!areaSeleccionada && (
                    <p className="text-center text-gray-400 text-sm mt-10">Selecciona un área para ver sus sub-áreas</p>
                )}
                {areaSeleccionada && loadingSubAreas && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
                {areaSeleccionada && !loadingSubAreas && subAreas.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">No hay sub-áreas para esta área.</p>
                )}
                <div className="flex flex-col gap-2">
                    {subAreas.map(subArea => (
                        <div key={subArea.cod_subarea}
                            className="flex justify-between items-center p-3 rounded-xl border border-slate-200">
                            <span className="text-sm text-slate-700">{subArea.descripcion}</span>
                            <button onClick={() => abrirFormSubArea(subArea)}
                                className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                <FaEdit size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
