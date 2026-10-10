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

  const login = async (credencial_acceso: string, password = '', targetRole?: UserRole): Promise<boolean> => {
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
    } catch (error: any) {
      // 1. Si el servidor respondió con un código de error (ej. 401 Credenciales inválidas, 400, etc.), DENEGAR ACCESO
      if (error?.response) {
        console.warn('Acceso denegado por el servidor: Usuario o contraseña incorrectos');
        return false;
      }

      // 2. Si el servidor no responde (modo offline/desconectado), validar estrictamente:
      // NUNCA aceptar contraseñas incorrectas o arbitrarias
      const normalized = credencial_acceso.trim().toLowerCase();
      const enteredPass = password.trim();

      // Recuperar posible contraseña actualizada por recuperación
      const customPass = localStorage.getItem(`gpon_user_pwd_${normalized}`);

      interface ValidAccount {
        rol: UserRole;
        nombre: string;
        passwords: string[];
      }

      const validAccounts: Record<string, ValidAccount> = {
        'admin@gpon.com': {
          rol: 'Admin',
          nombre: 'Ing. Carlos Mendoza (Admin)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        },
        'admin': {
          rol: 'Admin',
          nombre: 'Ing. Carlos Mendoza (Admin)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        },
        'soporte@gpon.com': {
          rol: 'Soporte',
          nombre: 'Ing. Sofía Ramírez (Soporte)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        },
        'soporte': {
          rol: 'Soporte',
          nombre: 'Ing. Sofía Ramírez (Soporte)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        },
        'tecnico@gpon.com': {
          rol: 'Tecnico',
          nombre: 'Juan Pérez (Técnico)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        },
        'tecnico': {
          rol: 'Tecnico',
          nombre: 'Juan Pérez (Técnico)',
          passwords: ['admin123', ...(customPass ? [customPass] : [])]
        }
      };

      const account = validAccounts[normalized];

      // Si el usuario no existe o la contraseña no coincide exactamente: DENEGAR ACCESO
      if (!account || !account.passwords.includes(enteredPass)) {
        console.warn('Intento de acceso rechazado: Usuario o contraseña incorrectos.');
        return false;
      }

      const demoUser: User = {
        id_usuario: `local-${account.rol.toLowerCase()}`,
        nombre_completo: account.nombre,
        credencial_acceso: normalized.includes('@') ? normalized : `${normalized}@gpon.com`,
        rol: targetRole || account.rol
      };

      const demoToken = 'gpon-auth-token-verified';
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
