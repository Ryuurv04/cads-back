import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import Swal from 'sweetalert2';


const tabs = [
    { id: 'roles_permisos', label:'Roles y Permisos', ic:'users', permission: 'ROLES'},
    { id: 'equipos', label:'Equipos', ic:'boxes', permission: 'EQUIPOS'},
];

export const useConfig = (onClose) => {
    const [tabActiva, setTabActiva] = useState('roles_permisos');
    const {hasPermission} = useAuth()
    const filteredTabs = tabs.filter( (e)=> !e.permission || hasPermission(e.permission)
    );

    const toggleCollapse = () => setCollapsed(prev => !prev);


    return {
        tabActiva,
        filteredTabs,
        setTabActiva,
    };
};