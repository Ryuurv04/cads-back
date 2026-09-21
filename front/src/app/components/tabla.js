'use client';
import React from 'react';
import { FaCircleInfo } from "react-icons/fa6";
import Estadopill from '@/app/components/estadopill';
const Tabla = ({ data, ocultarColumna = [] ,onclick,numeracion, view='table'}) => {
       // Generar encabezado dinámico desde las llaves de la primera fila
        const todasColumnas = Object.keys(data[0]);
        console.log(data)
        // Eliminar las primeras N columnas según el índice
        const columnasVisibles = todasColumnas.filter((_, index) => !ocultarColumna.includes(index));
        // Formatear encabezado
        const encabezado = columnasVisibles.map((key) => ({
            accessor: key,
            value: key.replace(/_/g, ' ').toUpperCase()
        }));
    return (
        <div className="pt-5 px-9 pb-16">
            <div className={view === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5' : 'card overflow-hidden'}>
                {view === 'grid' ? 
                (data.map((item, i) => (
                    <div key={i} className={`card flex flex-col gap-2.5 p-4 cursor-pointer`}  onClick={onclick && (() => onclick(data[i]))}>
                        <div className="flex justify-between items-start">
                            <div className={`mono text-[12px] text-[var(--ink-3)] `}>
                                {item.marbete}
                            </div>
                            <Estadopill estado={item.estado} valor_estado={item.estado_valor}/>                            
                        </div>
                        <div className="placeholder-hatch h-[90px]">{item.tipo_equipo}</div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div><div className="muted font-[family-name:var(--f-mono)] text-[10.5px] tracking-wider uppercase">N/Serie</div>{item.serie}</div>                            
                            <div><div className="muted font-[family-name:var(--f-mono)] text-[10.5px] tracking-wider uppercase">Fecha de Recepción</div>{item.fecha_recepcion}</div>
                        </div>
                    </div>
                )))
                :
                (<table className="tbl">
                <thead className=''>
                    <tr >
                        {
                            
                            numeracion  ? (
                                <th className='w-9'>
                                    No.
                                </th>
                            ) : null
                            }
                            {
                        encabezado.map((e) => (
                            <th key={e.accessor}>
                                {e.value}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((product, i) => (
                        <tr key={i} className="md:hover:bg-gray-50 md:cursor-pointer rounded-xl shadow-sm md:rounded-none md:table-row flex flex-col border md:border-0 border-gray-200  mb-1 md:mb-0" onClick={onclick && (() => onclick(data[i]))}>
                            {
                            numeracion  ? (
                                <td
                                    className="px-5 py-5 md:border-b border-gray-200 bg-white text-sm flex justify-between items-center md:table-cell"
                                >
                                    <span className="font-semibold md:hidden block text-gray-600 ">No.</span>
                                    <span className="font-semibold  text-gray-600 ">{i + 1}</span>
                                </td>
                            ) : null
                            }
                            {
                            encabezado.map((e) => (
                                e.accessor === 'estado' ? (
                                <td
                                    key={e.accessor}
                                    className="px-5 py-5  md:border-b border-gray-200 bg-white text-sm flex justify-between items-center md:table-cell"
                                >
                                    <span className="font-semibold md:hidden block text-gray-600 ">{e.value}</span>
                                    <Estadopill estado={product[e.accessor]} valor_estado={product.estado_valor} />
                                </td>):
                                (<td
                                    key={e.accessor}
                                    className="px-5 py-5 md:border-b border-gray-200 bg-white text-sm flex justify-between items-center md:table-cell"
                                >
                                    <span className="font-semibold md:hidden block text-gray-600 ">{e.value}</span>
                                    <span className="font-semibold  text-gray-600 ">{product[e.accessor]}</span>
                                </td>)
                            ))}
                        </tr>
                    ))}
                </tbody>
                </table>)}
            </div>
            
        </div>
    );
};

export default Tabla;
