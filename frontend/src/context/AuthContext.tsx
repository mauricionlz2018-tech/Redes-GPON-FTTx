import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credencial: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  updateUserData: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gpon_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar usuario guardado o verificar sesión
  useEffect(() => {
    const savedUser = localStorage.getItem('gpon_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parseando usuario guardado', e);
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (credencial_acceso: string, password?: string): Promise<boolean> => {
    if (!credencial_acceso?.trim() || !password) {
      throw new Error('Debes ingresar tu usuario y contraseña.');
    }

    try {
      const response = await api.post('/auth/login', {
        credencial_acceso: credencial_acceso.trim(),
        password
      });

      if (response.data && response.data.success && response.data.data) {
        const { token: newToken, usuario } = response.data.data;
        localStorage.setItem('gpon_token', newToken);
        localStorage.setItem('gpon_user', JSON.stringify(usuario));
        setToken(newToken);
        setUser(usuario);
        return true;
      }
      throw new Error(response.data?.message || 'Usuario o contraseña incorrectos.');
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      // Si el servidor respondió con un mensaje específico (ej: Usuario o contraseña incorrectos)
      const serverMessage = error.response?.data?.message;
      if (serverMessage) {
        throw new Error(serverMessage);
      }
      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new Error('Usuario o contraseña incorrectos.');
      }
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Tiempo de espera agotado al conectar con el servidor.');
      }
      throw new Error(error.message || 'Error al conectar con el servidor de autenticación.');
    }
  };

  const logout = () => {
    localStorage.removeItem('gpon_token');
    localStorage.removeItem('gpon_user');
    setToken(null);
    setUser(null);
  };

  // Cambio instantáneo de rol para propósitos de prueba y evaluación de RBAC
  const switchRole = async (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      Admin: 'admin@gpon.com',
      Soporte: 'soporte@gpon.com',
      Tecnico: 'tecnico@gpon.com'
    };

    await login(emailMap[role], 'admin123');
  };

  // Actualizar datos del usuario logueado en memoria y localStorage
  const updateUserData = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('gpon_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchRole, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
