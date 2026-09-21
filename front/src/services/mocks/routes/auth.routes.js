import { MOCK_CUENTAS, MOCK_CUENTA_MULTIROL, MOCK_PANTALLAS_POR_ROL } from '../auth.mock';

export const authRoutes = {
    'POST /auth/login': ({ email, password }) => {
        if (!email || !password) {
            return { status: 400, data: { message: 'Correo y contraseña son obligatorios.' } };
        }


        if (email === MOCK_CUENTA_MULTIROL.email && password === MOCK_CUENTA_MULTIROL.password) {
            return {
                status: 200,
                data: {
                    requireRoleSelection: true,
                    cod_usuario: MOCK_CUENTA_MULTIROL.cod_usuario,
                    roles: MOCK_CUENTA_MULTIROL.roles,
                },
            };
        }

        const cuenta = MOCK_CUENTAS.find((c) => c.email === email && c.password === password);
        if (!cuenta) {
            return { status: 401, data: { message: 'Credenciales inválidas.' } };
        }

        return {
            status: 200,
            data: {
                requireRoleSelection: false,
                user: cuenta.user,
                pantallas: MOCK_PANTALLAS_POR_ROL[cuenta.user.rol] ?? [],
            },
        };
    },
};
