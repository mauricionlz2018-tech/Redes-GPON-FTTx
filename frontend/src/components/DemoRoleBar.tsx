import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Wrench, ShieldCheck, Lock, LogOut, KeyRound, Info, X } from 'lucide-react';
import { UserRole } from '../types';

interface DemoRoleBarProps {
  onOpenDisclaimer?: () => void;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  if (!user) return null;

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; desc: string; email: string; level: string }> = {
    Admin: {
      label: 'Administrador NOC',
      icon: Shield,
      color: 'bg-indigo-600 text-white',
      desc: 'Control total de la infraestructura, chasis OLT, distribución ODF, creación de usuarios y reportes ejecutivos.',
      email: 'admin@gpon.com',
      level: 'Nivel 1 (Total)'
    },
    Soporte: {
      label: 'Soporte Técnico',
      icon: ShieldAlert,
      color: 'bg-emerald-600 text-white',
      desc: 'Gestión de abonados, diagnóstico de atenuación óptica, reasignación y liberación de puertos NAP.',
      email: 'soporte@gpon.com',
      level: 'Nivel 2 (Operativo)'
    },
    Tecnico: {
      label: 'Técnico de Planta Externa',
      icon: Wrench,
      color: 'bg-amber-600 text-white',
      desc: 'Acceso en campo satelital, georreferenciación GPS, mediciones de potencia Rx y enrolamiento.',
      email: 'tecnico@gpon.com',
      level: 'Nivel 3 (Campo)'
    }
  };

  const currentMeta = roleMeta[user.rol] || roleMeta.Admin;
  const RoleIcon = currentMeta.icon;

  const handleSwitchAccount = (roleEmail: string) => {
    setIsSwitchModalOpen(false);
    logout();
    navigate(`/login?credencial=${encodeURIComponent(roleEmail)}`);
  };

  return (
    <>
      <aside
        aria-label="Barra de Seguridad y Sesión RBAC"
        className="bg-slate-900 border-b border-slate-800 text-slate-200 px-3 sm:px-4 py-1.5 text-xs w-full overflow-hidden transition-colors select-none shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Indicador de Seguridad JWT + RBAC */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="hidden md:inline font-mono text-[10px] text-emerald-400/90 font-semibold tracking-wide">
                JWT-BEARER • RBAC
              </span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span className="text-slate-300">Sesión Activa:</span>
              <strong className="text-white font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                {user.nombre_completo}
              </strong>
            </div>
          </div>

          {/* Badge de Rol y Botón de Conmutación Autenticada */}
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentMeta.color} shadow-xs`}
              title={`${currentMeta.label} - ${currentMeta.desc}`}
            >
              <RoleIcon className="w-3 h-3 shrink-0" />
              <span>{user.rol}</span>
              <span className="hidden lg:inline text-[9px] opacity-80 font-normal">({currentMeta.level})</span>
            </div>

            <button
              onClick={() => setIsSwitchModalOpen(true)}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Cambiar de perfil de seguridad (Requiere autenticación formal con contraseña)"
            >
              <KeyRound className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Cambiar Cuenta</span>
              <span className="sm:hidden">Cuenta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Conmutación de Cuenta RBAC con Verificación de Credenciales */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Control de Acceso RBAC GPON
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Autenticación Criptográfica JWT (RFC 7519)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                El sistema valida estrictamente los permisos según el rol asignado en la base de datos PostgreSQL. Para alternar de perfil, se revocará el token actual y deberá ingresar las credenciales autorizadas.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Selecciona la cuenta para iniciar sesión:
              </p>

              {(Object.keys(roleMeta) as UserRole[]).map((rKey) => {
                const meta = roleMeta[rKey];
                const Icon = meta.icon;
                const isCurrent = user.rol === rKey;

                return (
                  <button
                    key={rKey}
                    onClick={() => handleSwitchAccount(meta.email)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {meta.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                              Sesión Actual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {meta.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline">
                      Autenticar &rarr;
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsSwitchModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión Completa</span>
              </button>

              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Permanecer en {user.rol}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
