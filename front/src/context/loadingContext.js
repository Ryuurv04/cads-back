'use client';

import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('Cargando página...');

    const startLoading = (msg = 'Cargando página...') => {
        setMensaje(msg);
        setLoading(true);
    };

    const stopLoading = () => setLoading(false);

    return (
        <LoadingContext.Provider value={{ loading, mensaje, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error('useLoading debe usarse dentro de LoadingProvider');
    return ctx;
}
