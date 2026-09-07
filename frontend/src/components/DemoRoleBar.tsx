import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Wrench, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

export const DemoRoleBar: React.FC = () => {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  const roles: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'Admin',
      label: 'Administrador',
      icon: Shield,
      color: 'bg-indigo-600 text-white',
      desc: 'Acceso total a ODF, NAPs, Clientes y Reportes'
    },
    {
      role: 'Soporte',
      label: 'Soporte Técnico',
      icon: ShieldAlert,
      color: 'bg-emerald-600 text-white',
      desc: 'Gestión de infraestructura y corrección/liberación de puertos'
    },
    {
      role: 'Tecnico',
      label: 'Técnico de Campo',
      icon: Wrench,
      color: 'bg-amber-600 text-white',
      desc: 'Lectura y asignación inicial (Edición/Liberación restringida 403)'
    }
  ];

  return (
    <aside aria-label="Selector de rol demo" className="bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs w-full overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 flex-shrink-0">
          <span className="font-semibold text-slate-800 dark:text-slate-300 text-[11px] sm:text-xs">RBAC:</span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">Simulador de roles de campo</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = user.rol === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                title={r.desc}
                className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? `${r.color} shadow-sm ring-1 sm:ring-2 ring-indigo-500/30 dark:ring-white/20 font-semibold`
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 dark:border-transparent dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span>{r.role}</span>
                {isActive && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 text-emerald-300" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

