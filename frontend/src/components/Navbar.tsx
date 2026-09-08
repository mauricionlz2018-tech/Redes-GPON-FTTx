import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
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
  UserCog,
  Sun,
  Moon,
  Bot
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow } = useNetwork();
  const { theme, toggleTheme } = useTheme();
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
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur sticky top-0 z-30 w-full overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Logo y Nombre de la Empresa */}
            <Link to="/mapa" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink group">
              <div className="bg-white p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center h-9 sm:h-10 flex-shrink-0">
                <img
                  src="/logo-gpon.png"
                  alt="Gpon Telecom"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1 sm:gap-1.5 truncate">
                  GPON TELECOM
                  <span className="text-[8px] sm:text-[10px] uppercase font-semibold px-1 sm:px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex-shrink-0">
                    FTTx
                  </span>
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden md:block truncate">
                  Inventario y Mapeo Lógico de Fibra
                </p>
              </div>
            </Link>

            {/* Navegación Principal en Desktop */}
            <nav className="hidden sm:flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Acciones derechas: Tema, APK, Red y Perfil */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Botón Conmutador de Modo Claro / Oscuro */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-semibold shadow-sm"
                title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden lg:inline text-[11px]">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden lg:inline text-[11px]">Oscuro</span>
                  </>
                )}
              </button>

              {/* Botón de Asistente Virtual y Manual */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-gpon-assistant'))}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-all text-xs font-semibold shadow-sm active:scale-95"
                title="Abrir Asistente Virtual y Manual de Usuario"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Asistente</span>
              </button>

              {/* Botón de Instalar Aplicación / APK */}
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md shadow-emerald-950/20 transition-all active:scale-95"
                title="Centro de Descarga e Instalación APK"
              >
                <Download className="w-3.5 h-3.5" />
                <span>APK</span>
              </button>

              {/* Indicador de Red */}
              <div className="flex items-center">
                {isOnline ? (
                  <div
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-1 sm:px-2 sm:py-1 rounded-full border border-emerald-500/20"
                    title="Conexión en línea activa"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">En Línea</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1 sm:px-2 sm:py-1 rounded-full border border-amber-500/20 animate-pulse"
                    title="Sin conexión a internet. Modo Offline"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Offline</span>
                  </div>
                )}

                {/* Botón de Sincronización si hay mutaciones en cola */}
                {pendingCount > 0 && (
                  <button
                    onClick={syncNow}
                    disabled={!isOnline || isSyncing}
                    className="ml-1 flex items-center gap-1 text-[10px] font-medium bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded-md transition-all shadow-sm disabled:opacity-50"
                    title="Sincronizar cambios pendientes con el servidor"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sync</span> ({pendingCount})
                  </button>
                )}
              </div>

              {/* Perfil de Usuario con opción para Editar */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-1.5 sm:pl-2">
                <button
                  onClick={() => setIsEditUserOpen(true)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group"
                  title="Editar perfil de usuario"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate max-w-[120px]">
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
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-600/30 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors">
                    <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Navegación Inferior Fija (Móvil / Smartphone) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur px-4 py-1.5 flex items-center justify-around shadow-2xl transition-colors">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

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
    </>
  );
};

