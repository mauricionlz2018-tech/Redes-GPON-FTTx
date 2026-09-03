import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { EditUserModal } from './EditUserModal';
import { InstallPwaModal } from './InstallPwaModal';
import {
  Network,
  MapPin,
  Users,
  FileText,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  UserCog
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow } = useNetwork();
  const location = useLocation();

  if (!user) return null;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const navLinks = [
    { to: '/mapa', label: 'Mapa de Red', icon: MapPin },
    { to: '/clientes', label: 'Abonados', icon: Users },
    { to: '/reportes', label: 'Reportes PDF', icon: FileText }
  ];

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'Admin':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Soporte':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo y Nombre de la Empresa */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-sky-600 to-cyan-400 p-2 rounded-lg text-white shadow-md shadow-sky-900/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                GPON TELECOM
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  FTTx
                </span>
              </span>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Inventario y Mapeo Lógico de Fibra
              </p>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Acciones derechas: PWA, Red y Perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón de Instalar Aplicación (Móvil y Escritorio) */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-lg shadow-md shadow-emerald-950/40 transition-all active:scale-95"
                title="Instalar como Aplicación en Celular o PC"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Instalar App</span>
              </button>
            )}

            {/* Indicador de Red */}
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <div
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20"
                  title="Conexión en línea activa"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">En Línea</span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20 animate-pulse"
                  title="Sin conexión a internet. Los cambios se guardan localmente en IndexedDB"
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Modo Offline</span>
                </div>
              )}

              {/* Botón de Sincronización si hay mutaciones en cola */}
              {pendingCount > 0 && (
                <button
                  onClick={syncNow}
                  disabled={!isOnline || isSyncing}
                  className="flex items-center gap-1 text-[11px] font-medium bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded-md transition-all shadow-sm disabled:opacity-50"
                  title="Sincronizar cambios pendientes con el servidor"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({pendingCount})</span>
                </button>
              )}
            </div>

            {/* Perfil de Usuario con opción para Editar */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 sm:pl-3">
              <button
                onClick={() => setIsEditUserOpen(true)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left group"
                title="Editar mi perfil y credenciales"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors truncate max-w-[130px]">
                    {user.nombre_completo.split('(')[0]}
                  </p>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadge(
                      user.rol
                    )}`}
                  >
                    {user.rol}
                  </span>
                </div>
                <div className="p-1.5 bg-slate-800 group-hover:bg-indigo-600/30 text-slate-300 group-hover:text-indigo-400 border border-slate-700 rounded-lg transition-colors">
                  <UserCog className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isInstallModalOpen && (
        <InstallPwaModal
          deferredPrompt={deferredPrompt}
          onClose={() => setIsInstallModalOpen(false)}
          onInstallSuccess={() => setIsInstalled(true)}
        />
      )}

      {isEditUserOpen && (
        <EditUserModal onClose={() => setIsEditUserOpen(false)} />
      )}
    </header>
  );
};

