'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/context/loadingContext';
import LoadingOverlay from './loadingOverlay';

export default function NavigationLoader() {
    const pathname = usePathname();
    const { loading, mensaje, startLoading, stopLoading } = useLoading();
    const prevPath = useRef(pathname);

    // Cuando el pathname cambia = navegación completada → apaga el loader
    useEffect(() => {
        if (prevPath.current !== pathname) {
            stopLoading();
            prevPath.current = pathname;
        }
    }, [pathname]);

    // Intercepta clicks en <Link> (elementos <a> internos)
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('/') && href !== pathname) {
                startLoading();
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    if (!loading) return null;
    return <LoadingOverlay mensaje={mensaje} />;
}
