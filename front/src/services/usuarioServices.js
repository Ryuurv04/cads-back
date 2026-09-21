import api from './api';

export const usuarioServices = {
    getUsuarios: (params) => api.get('/usuarios', { params }),
    getRoles: () => api.get('/roles'),
    getSubAreas: () => api.get('/subareas'),
    crearUsuario: (datos) => api.post('/usuarios', datos),
    editarUsuario: (cod_usuario, datos) => api.put(`/usuarios/${cod_usuario}`, datos),
    toggleEstado: (cod_usuario) => api.patch(`/usuarios/${cod_usuario}/estado`),
    enviarResetPassword: (cod_usuario) => api.post(`/usuarios/${cod_usuario}/reset-password`),
};
