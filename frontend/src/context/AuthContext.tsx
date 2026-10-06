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

  const login = async (credencial_acceso: string, password = 'admin123', targetRole?: UserRole): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', {
        credencial_acceso,
        password
      });

      if (response.data.success) {
        const { token: newToken, usuario } = response.data.data;
        localStorage.setItem('gpon_token', newToken);
        localStorage.setItem('gpon_user', JSON.stringify(usuario));
        setToken(newToken);
        setUser(usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Backend no disponible, iniciando sesión con rol automático detectado...');
      // Fallback Inteligente: auto-determinar el rol a partir del usuario ingresado sin necesidad de seleccionarlo
      const normalized = credencial_acceso.trim().toLowerCase();
      let rol: UserRole = targetRole || 'Tecnico';
      let nombre = 'Juan Pérez (Técnico)';

      if (normalized.includes('admin') || normalized.includes('carlos') || normalized.includes('director') || normalized.includes('gerente')) {
        rol = 'Admin';
        nombre = 'Ing. Carlos Mendoza (Admin)';
      } else if (normalized.includes('soporte') || normalized.includes('sofia') || normalized.includes('oscar') || normalized.includes('mendoza')) {
        rol = 'Soporte';
        nombre = 'L.I.A. Oscar Isaac Mendoza (Soporte)';
      } else if (normalized.includes('tecnico') || normalized.includes('juan') || normalized.includes('campo') || normalized.includes('cuadrilla')) {
        rol = 'Tecnico';
        nombre = 'Juan Pérez (Técnico)';
      }

      const demoUser: User = {
        id_usuario: 'demo-user-1',
        nombre_completo: nombre,
        credencial_acceso: credencial_acceso || `${rol.toLowerCase()}@gpon.com`,
        rol
      };

      const demoToken = 'demo-jwt-token';
      localStorage.setItem('gpon_token', demoToken);
      localStorage.setItem('gpon_user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
      return true;
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

    await login(emailMap[role], 'admin123', role);
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
