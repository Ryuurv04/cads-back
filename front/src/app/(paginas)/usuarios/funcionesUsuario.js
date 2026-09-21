'use client';
import { FaUserEdit, FaPowerOff, FaKey } from 'react-icons/fa';

export const Tabla = ({ data, onClickEstado, onClickEditar, onClickReset, usuarioActual }) => {
    return (
        <table className="w-full leading-normal md:min-w-full">
            <thead className='hidden md:table-header-group'>
                <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Usuario
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Subárea
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Roles
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((usuario, i) => (
                    <tr key={i} className="md:hover:bg-gray-50 rounded-xl shadow-sm md:rounded-none md:table-row flex flex-col border md:border-0 border-gray-200 mb-1 md:mb-0">
                        <td className="px-5 py-4 md:border-b border-gray-200 bg-white flex justify-between items-center md:table-cell">
                            <span className="font-semibold md:hidden block text-gray-600">Nombre</span>
                            <div className='text-right md:text-left'>
                                <span className="font-semibold block text-gray-700">{usuario.nombre}</span>
                                <span className="text-xs text-gray-400">No. {usuario.num_empleado} · {usuario.correo}</span>
                            </div>
                        </td>
                        <td className="px-5 py-4 md:border-b border-gray-200 bg-white flex justify-between items-center md:table-cell">
                            <span className="font-semibold md:hidden block text-gray-600">Subárea</span>
                            <span className="text-gray-700">{usuario.nom_subarea || '—'}</span>
                        </td>
                        <td className="px-5 py-4 md:border-b border-gray-200 bg-white flex justify-between items-center md:table-cell">
                            <span className="font-semibold md:hidden block text-gray-600">Roles</span>
                            <span className="text-gray-700 text-sm">{usuario.roles || '—'}</span>
                        </td>
                        <td className="px-5 py-4 md:border-b border-gray-200 bg-white flex justify-between items-center md:table-cell">
                            <span className="font-semibold md:hidden block text-gray-600">Estado</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${usuario.estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {usuario.estado === 'A' ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td className="px-5 py-4 md:border-b border-gray-200 bg-white flex justify-end gap-1 items-center md:table-cell">
                            <button
                                title="Editar usuario"
                                onClick={() => onClickEditar(usuario)}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition">
                                <FaUserEdit />
                            </button>
                            <button
                                title="Enviar reset de contraseña"
                                onClick={() => onClickReset(usuario.cod_usuario)}
                                className="p-2 rounded-lg text-yellow-500 hover:bg-yellow-50 transition">
                                <FaKey />
                            </button>
                            <button
                                title={usuario.estado === 'A' ? 'Deshabilitar usuario' : 'Activar usuario'}
                                onClick={usuarioActual?.cod_usuario === usuario.cod_usuario ? undefined : () => onClickEstado(usuario.cod_usuario, usuario.estado)}
                                className={`p-2 rounded-lg transition
                                    ${usuarioActual?.cod_usuario === usuario.cod_usuario
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : usuario.estado === 'A'
                                            ? 'text-red-500 hover:bg-red-50'
                                            : 'text-green-500 hover:bg-green-50'
                                    }`}>
                                <FaPowerOff />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
