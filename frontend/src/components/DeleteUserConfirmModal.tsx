import React, { useState } from 'react';
import { User } from '../types';
import api from '../api/client';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteUserConfirmModalProps {
  userToDelete: User;
  onClose: () => void;
  onUserDeleted: (userId: string) => void;
}

export const DeleteUserConfirmModal: React.FC<DeleteUserConfirmModalProps> = ({
  userToDelete,
  onClose,
  onUserDeleted
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.delete(`/auth/usuarios/${userToDelete.id_usuario}`);
      if (res.data.success) {
        onUserDeleted(userToDelete.id_usuario);
        onClose();
      } else {
        setErrorMsg(res.data.message || 'No fue posible eliminar al usuario.');
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else {
        // Fallback local
        try {
          const raw = localStorage.getItem('gpon_managed_users');
          if (raw) {
            const list: User[] = JSON.parse(raw);
            const nextList = list.filter((u) => u.id_usuario !== userToDelete.id_usuario);
            localStorage.setItem('gpon_managed_users', JSON.stringify(nextList));
          }
        } catch {}
        onUserDeleted(userToDelete.id_usuario);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-user-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors">
        {/* Cabecera de advertencia con alto contraste */}
        <div className="bg-rose-50 dark:bg-rose-950/90 px-6 py-4 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-700 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3
              id="delete-user-modal-title"
              className="text-base font-bold text-rose-950 dark:text-rose-100"
            >
              Confirmar Baja de Personal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
            ¿Estás seguro de que deseas eliminar permanentemente de la plataforma al siguiente usuario?
          </p>

          <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {userToDelete.nombre_completo}
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Credencial: <span className="font-mono text-slate-900 dark:text-slate-100">{userToDelete.credencial_acceso}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rol: <span className="text-indigo-700 dark:text-indigo-300 font-bold">{userToDelete.rol}</span>
            </div>
          </div>

          <p className="text-xs text-rose-900 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
            ⚠️ Esta acción es irreversible. El usuario perderá el acceso inmediato al sistema y a las aplicaciones de campo.
          </p>
          <div className="flex items-start gap-2 text-xs text-rose-900 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>Esta acción es irreversible. El usuario perderá el acceso inmediato al sistema y a las aplicaciones de campo.</span>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-100 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          {/* Botones */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-5 py-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-950/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Usuario</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

