import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Network, Shield, ShieldAlert, Wrench, Lock, Mail, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [credencial, setCredencial] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const success = await login(credencial, password);
      if (success) {
        navigate('/mapa');
      } else {
        setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await switchRole(role);
      navigate('/mapa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo con resplandor sutil de fibra óptica */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-sky-600 to-cyan-400 rounded-2xl shadow-xl shadow-sky-900/30 text-white mb-4">
          <Network className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          GPON TELECOM S.A. de C.V.
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Sistema de Inventario y Mapeo Lógico de Red GPON / FTTx
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-xs text-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo o Usuario
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej. tecnico@gpon.com"
                  value={credencial}
                  onChange={(e) => setCredencial(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md shadow-sky-900/30 disabled:opacity-50"
            >
              <span>{loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Acceso Rápido Demo (1 Clic) */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Admin')}
              className="w-full mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/40"
            >
              <span>🗺️ Explorar Mapa y 16 Puertos FTTx (Modo Demo)</span>
            </button>

            <span className="block text-center text-xs font-semibold text-slate-400 mb-3">
              O elige un perfil de prueba para evaluar permisos:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Admin')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-200 transition-colors text-[11px]"
              >
                <Shield className="w-4 h-4 mb-1 text-indigo-400" />
                <span className="font-semibold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Soporte')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 transition-colors text-[11px]"
              >
                <ShieldAlert className="w-4 h-4 mb-1 text-emerald-400" />
                <span className="font-semibold">Soporte</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Tecnico')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-200 transition-colors text-[11px]"
              >
                <Wrench className="w-4 h-4 mb-1 text-amber-400" />
                <span className="font-semibold">Técnico</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

