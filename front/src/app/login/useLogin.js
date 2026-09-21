'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/authContext';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState('');
    const { user, isLoading, login, requiereRoleSelection, roles, atras, selectRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Si ya terminó de cargar y detecta un usuario, lo saca del login
        if (!isLoading && user && requiereRoleSelection != true && roles.length === 0) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router, requiereRoleSelection, roles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);

            if (requiereRoleSelection != true && user) {
                router.push('/dashboard');
            }
        } catch (error) {
            const errorMessage = error.message || error.response?.data?.message || 'Error de conexión o credenciales inválidas.';

            Swal.fire({
                icon: 'error',
                title: 'Error de Autenticación',
                text: errorMessage,
                confirmButtonText: 'Aceptar'
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        isSubmitting,
        handleSubmit,
        requiereRoleSelection,
        roles,
        rolSeleccionado, setRolSeleccionado,
        atras,
        selectRole,
    };
}
