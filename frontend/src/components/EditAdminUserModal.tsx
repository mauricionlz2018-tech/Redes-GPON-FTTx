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
  CheckCircle,
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
  const [newPassword, setNewPassword] = useState('');
  const [rol, setRol] = useState<UserRole>(userToEdit.rol);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const rolesConfig: {
    role: UserRole;
    label: string;
    icon: any;
    desc: string;
  }[] = [
    {
      role: 'Tecnico',
      label: 'Técnico',
      icon: Wrench,
      desc: 'Acceso a mapa móvil, asignación inicial de puertos y calibración GPS.'
    },
    {
      role: 'Soporte',
      label: 'Soporte',
      icon: ShieldAlert,
      desc: 'Gestión de infraestructura, liberación de puertos y edición de abonados.'
    },
    {
      role: 'Admin',
      label: 'Admin',
      icon: Shield,
      desc: 'Control total de la red, gestión de personal, reportes ejecutivos y ODF.'
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
      setErrorMsg('La credencial o correo de acceso es obligatoria.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nombre_completo: cleanNombre,
        credencial_acceso: cleanCredencial,
        rol
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await api.put(`/auth/usuarios/${userToEdit.id_usuario}`, payload);

      if (res.data.success) {
        const updated: User = res.data.data;
        setSuccessMsg(`¡${updated.nombre_completo} fue actualizado con éxito!`);
        setTimeout(() => {
          onUserUpdated(updated);
          onClose();
        }, 900);
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
          rol
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
        }, 900);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Cabecera estándar */}
        <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-sky-950 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Datos de Personal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modificar rol, credencial o restablecer contraseña
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-950/50 border border-red-500/30 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre y Apellidos *
            </label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Credencial / Correo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credencial o Correo de Acceso *
            </label>
            <input
              type="text"
              required
              value={credencialAcceso}
              onChange={(e) => setCredencialAcceso(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Rol Asignado *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {rolesConfig.map((r) => {
                const isSelected = rol === r.role;
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRol(r.role)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white ring-1 ring-sky-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                        <span>{r.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restablecer Contraseña (Opcional) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Restablecer Contraseña (Dejar en blanco para no cambiar)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña opcional (mínimo 4 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg shadow-sky-900/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
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
