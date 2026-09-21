'use client';
import { useAuth } from '@/context/authContext';
import { useRouter,usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Nav/nav';
import { FaBars } from 'react-icons/fa';
export default function PaginasLayout({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    // Redirección de seguridad
    useEffect(() => {
        if (isLoading) return;

        // 1. Si ya cargó y no hay usuario, fuera al login
        if (!user) {
            router.push('/login');
            return;
        }
        
    }, [isLoading, user, router]);

    // 1. MIENTRAS CARGA TRAS F5: Skeleton que ocupa toda la pantalla
    if (isLoading) {
        return <FullScreenSkeleton />;
    }

    // Si no hay usuario, no renderizamos nada para evitar errores de null
    if (!user) return null;

return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            
            {/* SIDEBAR: Estático en Desktop, Absolute en Móvil */}
            <Sidebar 
                user={user} 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />
            {/* CONTENIDO DERECHO */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Header para Móvil/Tablet (Botón Hamburguesa) */}
                <div className="lg:hidden p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <FaBars className="w-6 h-6 text-gray-700" />
                    </button>
                    <span className="text-xl font-semibold text-gray-800">CENAMEP</span>
                    <div className="w-6"></div>
                </div>

                {/* Área de Contenido Variable */}
                <main className="flex-1 overflow-y-auto">
                    <div >
                            {children}

                    </div>
                </main>
            </div>
        </div>
    );
}

function FullScreenSkeleton() {
    return (
        <div className="flex h-screen w-screen bg-gray-100 animate-pulse">
            <div className="w-64 bg-white border-r border-gray-200 hidden lg:block"></div>
            <div className="flex-1 flex flex-col">
                <div className="h-16 bg-white border-b border-gray-200 w-full"></div>
                <div className="p-8 space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
                </div>
            </div>
        </div>
    );
}