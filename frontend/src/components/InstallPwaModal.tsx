import React, { useState } from 'react';
import { Download, X, Smartphone, Apple, ExternalLink, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InstallPwaModalProps {
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  onClose,
  deferredPrompt,
  onInstallSuccess
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'apk' | 'direct' | 'ios'>('apk');
  const [downloading, setDownloading] = useState(false);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } else {
      alert(t('apk.directInstallAlert'));
    }
  };

  const handleDownloadApkPackage = () => {
    setDownloading(true);
    // Redirige al generador oficial de APKs de Microsoft PWABuilder pre-cargado con la URL de la app
    const pwaUrl = encodeURIComponent('https://redes-gpon-ft-txs.vercel.app');
    window.open(`https://www.pwabuilder.com/?url=${pwaUrl}`, '_blank');
    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp transition-colors">
        {/* Cabecera */}
        <div className="bg-sky-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-sky-950 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center h-10 w-10 flex-shrink-0">
              <img
                src="/logo-gpon.png"
                alt="GPON Telecom"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {t('apk.modalTitle')}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {t('apk.modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
            title={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestanas de Opciones */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('apk.tabApk')}</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('apk.tabPwa')}</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{t('apk.tabIos')}</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-xl space-y-3 text-center">
                <div className="w-16 h-16 mx-auto bg-white p-2 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <img
                    src="/logo-gpon.png"
                    alt="GPON Telecom"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('apk.pwaTitle')}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {t('apk.pwaDesc')}
                  </p>
                </div>

                <button
                  onClick={handleNativeInstall}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{deferredPrompt ? t('apk.installNowBtn') : t('apk.activateInstallBtn')}</span>
                </button>
              </div>

              {/* Guia si no sale el aviso directo */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  {t('apk.howToInstallChrome')}
                </span>
                <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-4 list-decimal">
                  <li>{t('apk.step1Chrome')}</li>
                  <li>{t('apk.step2Chrome')}</li>
                  <li>{t('apk.step3Chrome')}</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('apk.apkTitle')}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {t('apk.apkDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadApkPackage}
                    disabled={downloading}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{downloading ? t('apk.openingGenerator') : t('apk.generateApkBtn')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-300 block">{t('apk.apkStepsTitle')}</span>
                <p>{t('apk.apkStep1')}</p>
                <p>{t('apk.apkStep2')}</p>
                <p>{t('apk.apkStep3')}</p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl flex-shrink-0">
                    <Apple className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('apk.iosTitle')}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {t('apk.iosDesc')}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <p>{t('apk.iosStep1')}</p>
                  <p>{t('apk.iosStep2')}</p>
                  <p>{t('apk.iosStep3')}</p>
                  <p>{t('apk.iosStep4')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('apk.versionFooter')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
