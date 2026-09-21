import axios from 'axios';
import { USE_MOCK } from './mocks/config';
import { mockAdapter } from './mocks/mockAdapter';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // envía/recibe la cookie HttpOnly 'token' del backend
});

if (USE_MOCK) {
    api.defaults.adapter = mockAdapter;
}

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    setRol: (data) => api.post('/auth/selectRole', data),
    getMe: () => api.get('/auth/me'),
    getPermisos: () => api.get('/auth/permisos'),
    cambiarPassword: (token, password) => api.post('/usuarios/cambiar-password', { token, password }),
};

export const registroService = {
    validarRuc: (ruc, tipoContribuyente) => api.get('/registro/ruc', { params: { ruc, tipoContribuyente } }),
    enviarRegistro: (formData) => api.post('/registro', formData),
};

export default api;
