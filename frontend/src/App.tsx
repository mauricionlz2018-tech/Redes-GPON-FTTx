import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { Navbar } from './components/Navbar';
import { DemoRoleBar } from './components/DemoRoleBar';
import { LoginPage } from './pages/LoginPage';
import { MapViewPage } from './pages/MapViewPage';
import { ClientsPage } from './pages/ClientsPage';
import { ReportsPage } from './pages/ReportsPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de prueba de roles para evaluación de RBAC */}
      <DemoRoleBar />
      <Navbar />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
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
  );
};

export default App;

