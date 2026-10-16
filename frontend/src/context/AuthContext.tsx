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
    const normalized = credencial_acceso.trim().toLowerCase();
    const enteredPass = password.trim();

    // Recuperar posible contraseña actualizada por módulo de recuperación
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
      },
      'mauricio.tecnico@gpon.com': {
        rol: 'Tecnico',
        nombre: 'Mauricio Nolazco (Técnico Cuadrilla 2)',
        passwords: ['admin123', ...(customPass ? [customPass] : [])]
      },
      'daniel.soporte@gpon.com': {
        rol: 'Soporte',
        nombre: 'Ing. Daniel Benítez (Monitoreo NOC)',
        passwords: ['admin123', ...(customPass ? [customPass] : [])]
      }
    };


    const account = validAccounts[normalized];
    const isLocalMatch = account && account.passwords.includes(enteredPass);

    // 1. Acceso Ultra-Rápido Instantáneo (< 30ms) para cuentas institucionales verificadas
    // Evita que el usuario quede congelado 30 segundos si el backend en Render está en reposo (cold-start)
    if (isLocalMatch) {
      const demoUser: User = {
        id_usuario: `local-${account.rol.toLowerCase()}`,
        nombre_completo: account.nombre,
        credencial_acceso: normalized.includes('@') ? normalized : `${normalized}@gpon.com`,
        rol: targetRole || account.rol
      };
      const initialToken = localStorage.getItem('gpon_token') || 'gpon-auth-token-verified';
      localStorage.setItem('gpon_token', initialToken);
      localStorage.setItem('gpon_user', JSON.stringify(demoUser));
      setToken(initialToken);
      setUser(demoUser);

      // Sincronización transparente de JWT con el servidor en segundo plano
      api.post('/auth/login', { credencial_acceso, password }, { timeout: 8000 })
        .then((response) => {
          if (response.data?.success && response.data.data?.token) {
            localStorage.setItem('gpon_token', response.data.data.token);
            if (response.data.data.usuario) {
              localStorage.setItem('gpon_user', JSON.stringify(response.data.data.usuario));
              setUser(response.data.data.usuario);
            }
            setToken(response.data.data.token);
          }
        })
        .catch(() => {
          // Si el servidor está arrancando o fuera de línea, la sesión local validada continúa activa
        });

      return true;
    }

    // 2. Si es una cuenta conocida pero la contraseña es INCORRECTA: Denegar inmediatamente
    if (account && !account.passwords.includes(enteredPass)) {
      console.warn('Contraseña incorrecta para cuenta del sistema');
      return false;
    }

    // 3. Para cuentas adicionales creadas en la base de datos externa Neon/Postgres
    try {
      const response = await api.post(
        '/auth/login',
        { credencial_acceso, password },
        { timeout: 6000 }
      );

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
      console.warn('Acceso denegado:', error?.response?.data?.message || 'Error de autenticación');
      return false;
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
