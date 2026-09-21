
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 
import API_URL from '@/config/apiConfig';
const API_URL_COMPLETA = `${API_URL}/usuarios`; 
/*importacion de servicios */
import {usuarioServices} from '@/services/usuarioServices';

function Usuarios({ onSelectUsuario,id = 'UsuarioSelect', selectedUsuario, disable = false}) {


const [usuario,setUsuario] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
 const [selectedOption, setSelectedOption] = useState(null); // Nuevo estado para la opción seleccionada

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await usuarioServices.getSelectUsuarios();
                const data = response.data;
                console.log("Datos recibidos de la API:", response.data); // Agrega este log para verificar los datos
                const formattedOptions = data.data.map(tipo => ({
                    value: tipo.cod_usuario,
                    label: tipo.nombre,
                }));
                setUsuario(formattedOptions);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching tipos de vehículo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTipos();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

     useEffect(() => {
        // Este efecto se ejecuta cuando 'usuario' o 'selectedUsuario' cambian
        if (usuario.length > 0 && selectedUsuario) {
            const foundOption = usuario.find(option => option.value === selectedUsuario);
            setSelectedOption(foundOption);
        } else {
            setSelectedOption(null); // Limpia la selección si no hay datos o valor
        }
    }, [usuario, selectedUsuario]); // Dependencias del efecto

    const escribiendo =(selectedOption) =>{
        onSelectUsuario(selectedOption ? selectedOption.value : '' );

    };
    //si envian un valor lo pone por defecto
    const selectedOptionValue = usuario.find(
        option => option.value === selectedUsuario
    );

    return (
            <Select
            id={id}
            value={selectedOptionValue} // Le pasa la opción completa (objeto {value, label})
            onChange={escribiendo}
            options={usuario}            
            isDisabled={disable}
            placeholder={loading ? 'Cargando usuarios...' : 'Selecciona un usuario'}
            isClearable // Permite borrar la selección
            isSearchable // Habilita la búsqueda
            
        />
    );
}

export default Usuarios;