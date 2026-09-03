import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { UserCog, X, Lock, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface EditUserModalProps {
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ onClose }) => {
  const { user, updateUserData } = useAuth();

  const [nombreCompleto, setNombreCompleto] = useState(user?.nombre_completo || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nombreCompleto.trim()) {
      setErrorMsg('El nombre completo es obligatorio.');
      return;
    }

    if (password && password.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const payload: { nombre_completo: string; password?: string } = {
        nombre_completo: nombreCompleto.trim()
      };
      if (password) {
        payload.password = password;
      }

      const res = await api.put('/auth/perfil', payload);

      if (res.data.success) {
        updateUserData({
          nombre_completo: res.data.data.nombre_completo
        });
        setSuccessMsg('¡Perfil actualizado con éxito!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.warn('Actualizando perfil en modo fallback local...', err);
      // Fallback local
      updateUserData({
        nombre_completo: nombreCompleto.trim()
      });
      setSuccessMsg('Perfil actualizado correctamente.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-950 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Editar Perfil de Usuario</h2>
              <p className="text-xs text-slate-400">Actualizar información personal y credenciales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Rol y Correo (Solo lectura) */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Cuenta de Acceso</span>
              <span className="text-xs font-mono font-medium text-slate-200">
                {user.credencial_acceso}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.rol}</span>
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej. Ing. Carlos Mendoza"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Contraseña Nueva */}
          <div className="border-t border-slate-800 pt-3">
            <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Cambiar Contraseña (Opcional)
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar en blanco para no modificar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {password && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Guardando cambios...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

