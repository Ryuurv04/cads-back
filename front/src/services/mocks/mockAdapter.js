import { authRoutes } from './routes/auth.routes';

// Cada tabla de rutas mockea un dominio. Se agrega una entrada aquí a medida
// que se mockea cada endpoint nuevo — el resto sigue llamando al backend real.
const routeTables = [authRoutes];

const buscarHandler = (method, url) => {
    for (const tabla of routeTables) {
        const handler = tabla[`${method} ${url}`];
        if (handler) return handler;
    }
    return null;
};

const parseBody = (data) => {
    if (!data) return {};
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return {}; }
    }
    return data;
};

// Adapter de Axios: misma forma de entrada/salida que el adapter real (http/xhr),
// así los services no notan la diferencia entre llamar al mock o al backend.
export const mockAdapter = async (config) => {
    const method = (config.method || 'get').toUpperCase();
    const handler = buscarHandler(method, config.url);

    if (!handler) {
        const error = new Error(`[mock] No hay mock definido para ${method} ${config.url}`);
        error.config = config;
        throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const { status, data } = handler(parseBody(config.data), config);

    if (status >= 400) {
        const error = new Error(data?.message || 'Error');
        error.isAxiosError = true;
        error.config = config;
        error.response = { data, status, statusText: '', headers: {}, config };
        throw error;
    }

    return { data, status, statusText: 'OK', headers: {}, config };
};
