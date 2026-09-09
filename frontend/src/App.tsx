import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { DemoRoleBar } from './components/DemoRoleBar';
import { LoginPage } from './pages/LoginPage';
import { MapViewPage } from './pages/MapViewPage';
import { ClientsPage } from './pages/ClientsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AssistantChatbot } from './components/AssistantChatbot';
import { DataDisclaimerModal } from './components/DataDisclaimerModal';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const acknowledged = sessionStorage.getItem('gpon_disclaimer_acknowledged');
      if (!acknowledged) {
        setShowDisclaimer(true);
      }
    }
  }, [user]);

  React.useEffect(() => {
    const handleOpen = () => setShowDisclaimer(true);
    window.addEventListener('open-gpon-disclaimer', handleOpen);
    return () => window.removeEventListener('open-gpon-disclaimer', handleOpen);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-sky-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 flex flex-col w-full overflow-x-hidden">
      {/* Barra de prueba de roles para evaluación de RBAC con botón de aviso de datos */}
      <DemoRoleBar onOpenDisclaimer={() => setShowDisclaimer(true)} />
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-8 w-full max-w-full overflow-x-hidden">{children}</main>
      {/* Modal de Aviso de Privacidad y Entorno de Pruebas */}
      <DataDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
      {/* Asistente Virtual y Manual Interactivo de Red */}
      <AssistantChatbot />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/mapa"
              element={
                <ProtectedLayout>
                  <MapViewPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/clientes"
              element={
                <ProtectedLayout>
                  <ClientsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedLayout>
                  <ReportsPage />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/mapa" replace />} />
          </Routes>
        </Router>
      </NetworkProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

