'use client'

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/services/configService';
import BotonAgregar from '@/app/components/botonAgregar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaArrowsRotate } from 'react-icons/fa6';

const MySwal = withReactContent(Swal);

export default function ProveedoresSeccion() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');

    const cargarProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await configService.getProveedores({ buscar });
            setProveedores(data.data);
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Error cargando proveedores' });
        } finally {
            setLoading(false);
        }
    }, [buscar]);

    useEffect(() => { cargarProveedores(); }, [cargarProveedores]);

    const abrirFormProveedor = (proveedor = null) => {
        MySwal.fire({
            title: proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor',
            html: `
                <input id="nombre" class="swal2-input" placeholder="Nombre *" value="${proveedor?.nombre || ''}">
                <input id="correo" class="swal2-input" placeholder="Correo" value="${proveedor?.correo || ''}">
                <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${proveedor?.telefono || ''}">
            `,
            showCancelButton: true,
            confirmButtonText: proveedor ? 'Guardar' : 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nombre = document.getElementById('nombre').value;
                if (!nombre) { Swal.showValidationMessage('El nombre es requerido'); return false; }
                return {
                    ...(proveedor && { cod_proveedor: proveedor.cod_proveedor }),
                    nombre,
                    correo: document.getElementById('correo').value,
                    telefono: document.getElementById('telefono').value,
                };
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                if (proveedor) {
                    await configService.editarProveedor(result.value);
                } else {
                    await configService.crearProveedor(result.value);
                }
                MySwal.fire({ icon: 'success', title: '¡Éxito!', text: proveedor ? 'Proveedor actualizado' : 'Proveedor creado', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
                cargarProveedores();
            } catch (error) {
                MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
            }
        });
    };

    const eliminarProveedor = async (cod_proveedor) => {
        const confirm = await MySwal.fire({
            title: '¿Eliminar proveedor?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });
        if (!confirm.isConfirmed) return;
        try {
            await configService.deleteProveedor(cod_proveedor);
            MySwal.fire({ icon: 'success', title: '¡Eliminado!', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end', timerProgressBar: true });
            cargarProveedores();
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al eliminar' });
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h2 className="text-slate-700 font-bold text-sm uppercase tracking-widest">Proveedores</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        className="w-full md:w-56 px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                    />
                    <button onClick={cargarProveedores} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                        <FaArrowsRotate size={13} />
                    </button>
                    <BotonAgregar onClick={() => abrirFormProveedor()} texto="Nuevo Proveedor" />
                </div>
            </div>

            {loading && <p className="text-center text-[var(--bg-principal)] text-sm">Cargando...</p>}
            {!loading && proveedores.length === 0 && <p className="text-center text-gray-500 text-sm">No se encontraron proveedores.</p>}

            {!loading && proveedores.length > 0 && (
                <div className="overflow-x-hidden md:overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correo</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teléfono</th>
                                <th className="pb-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.map(proveedor => (
                                <tr key={proveedor.cod_proveedor} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                    <td className="py-3 font-medium text-slate-700">{proveedor.nombre}</td>
                                    <td className="py-3 text-slate-500">{proveedor.correo || '—'}</td>
                                    <td className="py-3 text-slate-500">{proveedor.telefono || '—'}</td>
                                    <td className="py-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => abrirFormProveedor(proveedor)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                                <FaEdit size={14} />
                                            </button>
                                            <button onClick={() => eliminarProveedor(proveedor.cod_proveedor)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
