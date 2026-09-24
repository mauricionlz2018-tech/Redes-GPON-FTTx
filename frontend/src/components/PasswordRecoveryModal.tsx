import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldCheck, Clock } from 'lucide-react';
import api from '../api/client';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess: (email: string) => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Temporizador de 3 minutos (180 segundos)
  const [secondsLeft, setSecondsLeft] = useState<number>(180);

  useEffect(() => {
    if (!isOpen) {
      // Resetear estados al cerrar
      setStep('request');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setSecondsLeft(180);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'verify' || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  if (!isOpen) return null;

  // Formato mm:ss para el temporizador
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const res = await api.post('/auth/recuperar-password', {
        credencial_acceso: cleanEmail,
        email: cleanEmail
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Código de seguridad enviado a tu correo.');
        setSecondsLeft(180); // Reiniciar reloj a 3 minutos
        setStep('verify');
      } else {
        setErrorMsg(res.data?.message || 'No se pudo procesar la solicitud.');
      }
    } catch (err: any) {
      const backendError = err.response?.data?.message || err.message || 'Error de conexión con el servidor.';
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (secondsLeft <= 0) {
      setErrorMsg('El código de 3 minutos ha expirado. Por favor solicita uno nuevo.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener un mínimo de 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Asegúrate de escribirlas idénticas.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const res = await api.post('/auth/reset-password', {
        credencial_acceso: cleanEmail,
        email: cleanEmail,
        codigo: code.trim(),
        token: code.trim(),
        newPassword
      });

      if (res.data?.success) {
        setStep('success');
      } else {
        setErrorMsg(res.data?.message || 'Error al restablecer la contraseña.');
      }
    } catch (err: any) {
      const backendError = err.response?.data?.message || err.message || 'Código de seguridad inválido o expirado.';
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Encabezado Corporativo y Formal (Sin degradados saturados ni estilo genérico de IA) */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-mono">
              GPON TELECOM S.A. DE C.V.
            </span>
            <h3 className="font-semibold text-sm text-slate-100 tracking-tight">
              Recuperación de Contraseña
            </h3>
            <p className="text-[11px] text-slate-400">
              Validación segura por correo electrónico (Gmail SMTP)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 space-y-4">
          
          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="leading-relaxed">
                <span className="font-semibold block">Aviso del Servidor:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Mensaje de Confirmación de Envío */}
          {successMsg && step === 'verify' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold">Código despachado a tu correo</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                  Revisa la bandeja de entrada o la sección de correo no deseado (Spam) de <span className="font-medium">{email}</span>.
                </p>
              </div>
            </div>
          )}

          {/* PASO 1: Ingreso de Correo / Usuario */}
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Introduce el correo o cuenta registrada en la empresa. El sistema te enviará un código de verificación de 6 dígitos con vigencia estricta de <strong>3 minutos</strong> para restablecer tu clave.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo o Usuario Registrado
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ej. mauricionlz2018@gmail.com o admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando por Correo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Código por Correo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Ingresar Código de 6 Dígitos y Nueva Contraseña */}
          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* Temporizador de 3 minutos */}
              <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
                secondsLeft > 30 
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold'
              }`}>
                <div className="flex items-center gap-2 font-sans font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Vigencia del código:</span>
                </div>
                <span className="tracking-wider">
                  {secondsLeft > 0 ? formatTime(secondsLeft) : 'EXPIRADO'}
                </span>
              </div>

              {/* Campo para el Código de 6 Dígitos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código de Seguridad (6 Dígitos de tu Gmail)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={secondsLeft <= 0}
                  placeholder="------"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 text-center text-xl font-mono font-bold tracking-[0.4em] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                />
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={secondsLeft <= 0}
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={secondsLeft <= 0}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Acciones: Sin flecha de regresar, diseño limpio y ordenado */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setStep('request');
                  }}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                >
                  Solicitar otro código
                </button>

                <button
                  type="submit"
                  disabled={loading || code.length < 6 || !newPassword || secondsLeft <= 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Restablecer Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: Confirmación de Éxito */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Contraseña Restablecida
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tu clave de acceso ha sido actualizada en el sistema central. Ya puedes ingresar con tu nueva credencial.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
