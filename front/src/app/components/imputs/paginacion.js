'use client';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useEffect} from 'react';

const MySwal = withReactContent(Swal);

// --- Nuevo Componente de Paginación ---
const Paginacion = ({ pagina, totalPaginas, onPaginaCambio }) => {


    useEffect(() => {
        if(totalPaginas<pagina && totalPaginas>0){
            onPaginaCambio(totalPaginas)
        }
        else if(totalPaginas === 0){
            onPaginaCambio(1)
        }
    }, [totalPaginas,pagina]);

    return (
        <div className="flex justify-center mt-4 space-x-2">
            <button
                onClick={() => onPaginaCambio(pagina - 1)}
                disabled={pagina <= 1}
                className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Página {pagina} de {totalPaginas}
            </span>
            <button
                onClick={() => onPaginaCambio(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
            </button>
        </div>
    );
};
export default Paginacion;