import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { DataDisclaimerModal } from '../components/DataDisclaimerModal';
import { PasswordRecoveryModal } from '../components/PasswordRecoveryModal';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [credencial, setCredencial] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  // Cargar credenciales recordadas al montar el componente
  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem('gpon_remember_me');
      const savedCredencial = localStorage.getItem('gpon_saved_credencial');
      const savedPassword = localStorage.getItem('gpon_saved_password');

      if (savedRemember === 'true' && savedCredencial) {
        setCredencial(savedCredencial);
        setRememberMe(true);
        if (savedPassword) {
          setPassword(savedPassword);
        }
      }
    } catch (e) {
      console.warn('Error leyendo credenciales guardadas:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('gpon_remember_me', 'true');
        localStorage.setItem('gpon_saved_credencial', credencial.trim());
        localStorage.setItem('gpon_saved_password', password);
      } else {
        localStorage.removeItem('gpon_remember_me');
        localStorage.removeItem('gpon_saved_credencial');
        localStorage.removeItem('gpon_saved_password');
      }

      // El sistema auto-detecta el rol según la cuenta en la base de datos o credencial
      const success = await login(credencial.trim(), password);
      if (success) {
        navigate('/mapa');
      } else {
        setErrorMsg('Credenciales inválidas. Verifica tu usuario/correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSuccess = (recoveredEmail: string) => {
    setCredencial(recoveredEmail);
    setInfoMsg('¡Contraseña actualizada exitosamente! Ingresa tu nueva contraseña para acceder.');
    setTimeout(() => setInfoMsg(null), 8000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Fondo con resplandor sutil de fibra óptica */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado Corporativo Oficial */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="flex justify-center mb-3">
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-sky-950/15 border border-slate-200 dark:border-slate-800 max-w-[240px] transition-transform hover:scale-102">
            <img
              src="/logo-gpon.png"
              alt="GPON TELECOM S.A. DE C.V."
              className="h-12 sm:h-14 w-auto object-contain mx-auto"
            />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          GPON TELECOM S.A. DE C.V.
        </h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Sistema de Gestión y Mapeo GPON / FTTx
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
          San José del Rincón, Estado de México
        </p>
      </div>

      {/* Tarjeta Principal de Inicio de Sesión */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 py-7 px-6 shadow-xl dark:shadow-2xl rounded-2xl sm:px-9 backdrop-blur transition-colors">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-200 rounded-xl animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 rounded-xl animate-fadeIn">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Correo o Usuario */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo o Usuario
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej. tecnico@gpon.com o tecnico"
                  value={credencial}
                  onChange={(e) => setCredencial(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox: Recordar Contraseña / Mantener Sesión Iniciada */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Recordar contraseña e inicio automático
                </span>
              </label>
            </div>

            {/* Botón Principal: Ingresar al Sistema */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-sky-900/20 disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              <span>{loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Aviso Compacto de Protección de Datos */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Entorno Seguro • GPON Telecom</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Aviso de Privacidad
            </button>
          </div>

        </div>
      </div>

      {/* Modal de Aviso de Privacidad y Datos */}
      <DataDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Modal de Recuperación de Contraseña con Envío SMTP */}
      <PasswordRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        initialEmail={credencial}
        onSuccess={handlePasswordResetSuccess}
      />
    </div>
  );
};
