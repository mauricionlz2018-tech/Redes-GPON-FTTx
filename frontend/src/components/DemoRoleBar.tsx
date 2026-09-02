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
    <aside aria-label="Selector de rol demo" className="bg-slate-950/80 border-b border-slate-800 px-3 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-semibold text-slate-300">Simulador de Roles (RBAC):</span>
          <span className="hidden sm:inline text-slate-400">Prueba los permisos del sistema con 1 clic</span>
        </div>

        <div className="flex items-center gap-1.5">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = user.rol === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                title={r.desc}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? `${r.color} shadow-sm ring-2 ring-white/20`
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {isActive && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

