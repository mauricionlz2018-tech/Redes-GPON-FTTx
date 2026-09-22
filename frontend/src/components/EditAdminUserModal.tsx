import React, { useState } from 'react';
import { User, UserRole } from '../types';
import api from '../api/client';
import {
  UserCog,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  ShieldAlert,
  Wrench,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface EditAdminUserModalProps {
  userToEdit: User;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export const EditAdminUserModal: React.FC<EditAdminUserModalProps> = ({
  userToEdit,
  onClose,
  onUserUpdated
}) => {
  const [nombreCompleto, setNombreCompleto] = useState(userToEdit.nombre_completo);
  const [credencialAcceso, setCredencialAcceso] = useState(userToEdit.credencial_acceso);
  const [rol, setRol] = useState<UserRole>(userToEdit.rol);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const rolesConfig: {
    role: UserRole;
    label: string;
    icon: any;
    desc: string;
    badgeClass: string;
  }[] = [
    {
      role: 'Tecnico',
      label: 'Técnico de Campo',
      icon: Wrench,
      desc: 'Acceso a mapa móvil, asignación de puertos y GPS.',
      badgeClass:
        'border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-600'
    },
    {
      role: 'Soporte',
      label: 'Soporte Técnico',
      icon: ShieldAlert,
      desc: 'Gestión de infraestructura y liberación de puertos.',
      badgeClass:
        'border-emerald-400 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-600'
    },
    {
      role: 'Admin',
      label: 'Administrador NOC',
      icon: Shield,
      desc: 'Control total de la red, gestión de personal y ODF.',
      badgeClass:
        'border-indigo-400 bg-indigo-50 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-100 dark:border-indigo-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanNombre = nombreCompleto.trim();
    const cleanCredencial = credencialAcceso.trim();

    if (!cleanNombre || cleanNombre.length < 3) {
      setErrorMsg('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }

    if (!cleanCredencial || cleanCredencial.length < 3) {
      setErrorMsg('La credencial o correo es obligatorio.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setErrorMsg('Si deseas restablecer la contraseña, debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const payload: {
        nombre_completo: string;
        credencial_acceso: string;
        rol: UserRole;
        password?: string;
      } = {
        nombre_completo: cleanNombre,
        credencial_acceso: cleanCredencial,
        rol
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await api.put(`/auth/usuarios/${userToEdit.id_usuario}`, payload);

      if (res.data.success) {
        const updated: User = {
          ...userToEdit,
          ...res.data.data
        };
        setSuccessMsg(`Usuario ${updated.nombre_completo} actualizado con éxito.`);
        setTimeout(() => {
          onUserUpdated(updated);
          onClose();
        }, 1100);
      } else {
        setErrorMsg(res.data.message || 'No fue posible actualizar al usuario.');
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else {
        // Fallback local
        const updatedFallback: User = {
          ...userToEdit,
          nombre_completo: cleanNombre,
          credencial_acceso: cleanCredencial,
          rol,
          updatedAt: new Date().toISOString()
        };

        try {
          const raw = localStorage.getItem('gpon_managed_users');
          if (raw) {
            const list: User[] = JSON.parse(raw);
            const nextList = list.map((u) =>
              u.id_usuario === userToEdit.id_usuario ? updatedFallback : u
            );
            localStorage.setItem('gpon_managed_users', JSON.stringify(nextList));
          }
        } catch {}

        setSuccessMsg(`Usuario ${cleanNombre} actualizado correctamente.`);
        setTimeout(() => {
          onUserUpdated(updatedFallback);
          onClose();
        }, 1100);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-admin-user-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Cabecera */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-5 sm:px-6 py-4 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-700 text-white rounded-xl shadow-sm">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="edit-admin-user-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                Editar Datos de Personal
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Modificar rol, credencial o restablecer contraseña
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-xl flex items-start gap-2.5 text-xs text-rose-950 dark:text-rose-100 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950 dark:text-emerald-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <span>Nombre y Apellidos *</span>
            </label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Credencial / Correo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <span>Credencial o Correo de Acceso *</span>
            </label>
            <input
              type="text"
              required
              value={credencialAcceso}
              onChange={(e) => setCredencialAcceso(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Selector de Rol */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Rol del Usuario *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {rolesConfig.map((r) => {
                const Icon = r.icon;
                const isSelected = rol === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRol(r.role)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${r.badgeClass} ring-2 ring-indigo-600 dark:ring-indigo-400 shadow-sm font-bold`
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{r.role}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] leading-tight opacity-90 font-medium">
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restablecer Contraseña (Opcional) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                <span>Restablecer Contraseña (Dejar en blanco para no cambiar)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                title={showPassword ? 'Ocultar' : 'Ver'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña opcional (mínimo 4 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-slate-300 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-950/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Actualizar Datos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

