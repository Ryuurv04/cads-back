import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import MenuData from './menuData';
import Swal from 'sweetalert2';

export const useSidebar = (onClose) => {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { logout, hasPermission, user } = useAuth()
    const filteredMenu = MenuData.filter(item =>
        (!item.permission || hasPermission(item.permission))
        && (!item.soloEmpresa || user?.rol === 'Empresa')
    );
    const navMain   = filteredMenu.filter(item => item.seccion !== 'configuracion');
    const navFooter = filteredMenu.filter(item => item.seccion === 'configuracion');
    const handleLogout = async () => {
        try {
            await logout(); 
            router.push('/login'); // Redirección tras login exitoso              
            onClose();
        } catch (error) {
            const errorMessage = error.message || error.response?.data?.message || 'Error de conexión';

            Swal.fire({
                icon: 'error',
                title: 'Error de Autenticación',
                text: errorMessage,
                confirmButtonText: 'Aceptar'
            });
        }
    };
    const toggleCollapse = () => setCollapsed(prev => !prev);
    return {
        collapsed,
        pathname,
        navMain,
        navFooter,
        toggleCollapse,
        handleLogout,
        router
    };
};