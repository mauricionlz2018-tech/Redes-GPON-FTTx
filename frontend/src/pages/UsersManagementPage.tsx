import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import api from '../api/client';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditAdminUserModal } from '../components/EditAdminUserModal';
import { DeleteUserConfirmModal } from '../components/DeleteUserConfirmModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Wrench,
  Search,
  Filter,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

const defaultFallbackUsers: User[] = [
  {
    id_usuario: 'user-admin-1',
    nombre_completo: 'Ing. Carlos Mendoza (Admin NOC)',
    credencial_acceso: 'admin@gpon.com',
    rol: 'Admin',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id_usuario: 'user-soporte-1',
    nombre_completo: 'Ing. Sofía Ramírez (Soporte Técnico)',
    credencial_acceso: 'soporte@gpon.com',
    rol: 'Soporte',
    createdAt: '2026-09-05T09:30:00.000Z'
  },
  {
    id_usuario: 'user-tecnico-1',
    nombre_completo: 'Juan Pérez (Técnico Cuadrilla 1)',
    credencial_acceso: 'tecnico@gpon.com',
    rol: 'Tecnico',
    createdAt: '2026-09-10T11:15:00.000Z'
  }
];

export const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'Todos' | UserRole>('Todos');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/usuarios');
      if (res.data.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
        try {
          localStorage.setItem('gpon_managed_users', JSON.stringify(res.data.data));
        } catch {}
      } else {
        loadFallbackUsers();
      }
    } catch (err) {
      console.warn('Backend no disponible, cargando usuarios en modo fallback local...');
      loadFallbackUsers();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFallbackUsers = () => {
    try {
      const saved = localStorage.getItem('gpon_managed_users');
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        setUsers(defaultFallbackUsers);
        localStorage.setItem('gpon_managed_users', JSON.stringify(defaultFallbackUsers));
      }
    } catch {
      setUsers(defaultFallbackUsers);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejo de eventos de creación, actualización y borrado
  const handleUserCreated = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    showNotification('success', `Personal "${newUser.nombre_completo}" registrado correctamente.`);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id_usuario === updatedUser.id_usuario ? updatedUser : u))
    );
    showNotification('success', `Datos de "${updatedUser.nombre_completo}" actualizados con éxito.`);
  };

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id_usuario !== deletedId));
    showNotification('success', 'El usuario fue eliminado del sistema.');
  };

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.credencial_acceso.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'Todos' || u.rol === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Métricas
  const totalUsers = users.length;
  const countTecnicos = users.filter((u) => u.rol === 'Tecnico').length;
  const countSoporte = users.filter((u) => u.rol === 'Soporte').length;
  const countAdmins = users.filter((u) => u.rol === 'Admin').length;

  const getRoleBadgeClasses = (rol: UserRole) => {
    switch (rol) {
      case 'Admin':
        return 'bg-indigo-100 text-indigo-950 border-indigo-400 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-600';
      case 'Soporte':
        return 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-600';
      case 'Tecnico':
        return 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600';
    }
  };

  const getRoleIcon = (rol: UserRole) => {
    switch (rol) {
      case 'Admin':
        return <Shield className="w-3.5 h-3.5" />;
      case 'Soporte':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'Tecnico':
        return <Wrench className="w-3.5 h-3.5" />;
    }
  };

  // Si el usuario actual no es Administrador, mostrar tarjeta de restricción RBAC
  if (currentUser?.rol !== 'Admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Acceso Restringido por Política RBAC
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto font-medium">
            El panel de <strong className="text-slate-900 dark:text-white">Gestión de Personal</strong> está reservado exclusivamente para cuentas con rol de <strong className="text-indigo-700 dark:text-indigo-300">Administrador</strong>.
          </p>
          <div className="pt-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              💡 Para propósitos de evaluación del sistema, puedes cambiar tu rol a <strong>Admin</strong> usando la barra superior de prueba de roles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Encabezado y Botón Principal de Alta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
              <span>Gestión de Personal y Técnicos</span>
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-400 dark:border-indigo-600">
              Admin RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Administración centralizada de cuadrillas de campo, técnicos de empalme, personal de soporte y administradores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors shadow-xs active:scale-95 cursor-pointer text-xs font-bold flex items-center gap-1.5"
            title="Recargar lista de usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-950/20 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>+ Agregar Personal</span>
          </button>
        </div>
      </div>

      {/* Notificación de feedback accesible */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-700'
              : 'bg-rose-50 text-rose-950 border-rose-400 dark:bg-rose-950/80 dark:text-rose-100 dark:border-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Tarjetas de Métricas de Personal con Alto Contraste */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Personal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Personal</span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalUsers}</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Usuarios registrados</p>
        </div>

        {/* Técnicos de Campo */}
        <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 p-4 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200">Técnicos de Campo</span>
            <div className="p-2 bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 rounded-lg border border-amber-400 dark:border-amber-700">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{countTecnicos}</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Cuadrillas activas</p>
        </div>

        {/* Soporte Técnico */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 p-4 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Soporte Técnico</span>
            <div className="p-2 bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 rounded-lg border border-emerald-400 dark:border-emerald-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{countSoporte}</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Mantenimiento y clientes</p>
        </div>

        {/* Administradores */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800/80 p-4 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Administradores</span>
            <div className="p-2 bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 rounded-lg border border-indigo-400 dark:border-indigo-700">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{countAdmins}</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Control total NOC</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar personal por nombre o correo (ej. Juan, tecnico@gpon.com)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 hidden md:block" />
          {(['Todos', 'Tecnico', 'Soporte', 'Admin'] as const).map((r) => {
            const isSelected = filterRole === r;
            const label = r === 'Todos' ? 'Todos' : r === 'Tecnico' ? 'Técnicos' : r === 'Soporte' ? 'Soporte' : 'Admins';
            return (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Usuarios Accesible con Alto Contraste */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Personal</th>
                <th className="py-3 px-4">Credencial / Acceso</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4 hidden md:table-cell">Fecha de Registro</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-600 dark:text-slate-400 font-medium">
                    No se encontraron usuarios que coincidan con la búsqueda o filtro aplicado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id_usuario === u.id_usuario;
                  const initials = u.nombre_completo
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={u.id_usuario}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Personal / Nombre */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                              u.rol === 'Admin'
                                ? 'bg-indigo-700 text-white border-indigo-800'
                                : u.rol === 'Soporte'
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : 'bg-amber-600 text-white border-amber-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.nombre_completo}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-400 dark:border-indigo-600">
                                  Tú
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block">
                              ID: {u.id_usuario.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Credencial / Correo */}
                      <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{u.credencial_acceso}</span>
                        </div>
                      </td>

                      {/* Rol con Badge de Alto Contraste */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeClasses(
                            u.rol
                          )}`}
                        >
                          {getRoleIcon(u.rol)}
                          <span>{u.rol}</span>
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('es-MX', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Activo'}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Editar usuario o rol"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-800'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-200 border-rose-300 dark:border-rose-800 cursor-pointer'
                            }`}
                            title={
                              isCurrent
                                ? 'No puedes autoeliminar tu propia cuenta en sesión'
                                : 'Eliminar usuario'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {isCreateOpen && (
        <CreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {editingUser && (
        <EditAdminUserModal
          userToEdit={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {deletingUser && (
        <DeleteUserConfirmModal
          userToDelete={deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
};

