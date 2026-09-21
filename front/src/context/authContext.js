'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [roles, setRoles] = useState([]);   
    const [pantallas, setPantallas] = useState([]);
    const [requiereRoleSelection, setRequiereRoleSelection] = useState(false);

    useEffect(() => {
        const recoverSession = async () => {
            // El token vive en una cookie HttpOnly — no se puede leer desde JS.
            // Se intenta /auth/me directamente; si no hay cookie válida, el backend responde 401
            // y eso simplemente significa "no hay sesión activa" (no es un error real).
            try {
                const [userRes] = await Promise.all([
                    authService.getMe()
                ]);
                setUser(userRes.data.user);
                setPantallas(userRes.data.pantallas);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        recoverSession();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        const { data } = await authService.login({ email, password });
        setRequiereRoleSelection(data.requireRoleSelection);
        if(data.requireRoleSelection === true){
            setRoles(data.roles);
            setUser(data.cod_usuario);
        }else {
            setUser(data.user);
            setPantallas(data.pantallas);
        }
        setIsLoading(false);
    };
    const atras = () => {
        setUser(null);        
        setRoles([]);
        setRequiereRoleSelection(false);
    }
    const selectRole = async (cod_rol) => {
        setIsLoading(true)
        try {
            const { data } = await authService.setRol({ cod_usuario:user, cod_rol });
            setUser(data.user);
            setPantallas(data.pantallas);
            setRequiereRoleSelection(false);
            setRoles([]);
        }
        catch (error) {
            console.error("Error seleccionando rol:", error);
            logout();
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error cerrando sesión:', error);
        } finally {
            setUser(null);
            setPantallas({});
            setIsLoading(false);
        }
    };

    const hasPermission = (key) => pantallas.includes(key);
    return (
        <AuthContext.Provider value={{ user, isLoading,requiereRoleSelection,pantallas, roles, login, logout,atras,selectRole,hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);