import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import api from '../api/client';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditAdminUserModal } from '../components/EditAdminUserModal';
import { DeleteUserConfirmModal } from '../components/DeleteUserConfirmModal';
import { TablePagination } from '../components/TablePagination';
import {
  UserCog,
  UserPlus,
  Shield,
  ShieldAlert,
  Wrench,
  Search,
  Filter,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  X
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

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Reset de página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Métricas
  const totalUsers = users.length;
  const countTecnicos = users.filter((u) => u.rol === 'Tecnico').length;
  const countSoporte = users.filter((u) => u.rol === 'Soporte').length;
  const countAdmins = users.filter((u) => u.rol === 'Admin').length;

  const getRoleBadgeClasses = (rol: UserRole) => {
    switch (rol) {
      case 'Admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
      case 'Soporte':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'Tecnico':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Acceso Restringido
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            El panel de Gestión de Personal está reservado exclusivamente para cuentas con rol de Administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-24 sm:py-6 space-y-6">
      {/* Encabezado uniforme con Abonados y Reportes */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Gestión de Personal y Técnicos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de cuadrillas de campo, técnicos de empalme, personal de soporte y administradores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
            title="Recargar lista de usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Agregar Personal</span>
          </button>
        </div>
      </div>

      {/* Notificación de feedback accesible */}
      {notice && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Tarjetas de Métricas de Personal con diseño estándar idéntico a Reportes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Personal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Personal</span>
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
              <UserCog className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalUsers}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Usuarios registrados</span>
        </div>

        {/* Técnicos de Campo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Técnicos de Campo</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countTecnicos}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Cuadrillas activas</span>
        </div>

        {/* Soporte Técnico */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Soporte Técnico</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countSoporte}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Mantenimiento y clientes</span>
        </div>

        {/* Administradores */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administradores</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countAdmins}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Control total NOC</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros con diseño estándar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar personal por nombre o correo (ej. Juan, tecnico@gpon.com)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:block" />
          {(['Todos', 'Tecnico', 'Soporte', 'Admin'] as const).map((r) => {
            const isSelected = filterRole === r;
            return (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {r === 'Todos' ? 'Todos' : r === 'Tecnico' ? 'Técnicos' : r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Personal uniforme con la tabla de Abonados */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-md transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Personal</th>
                <th className="px-4 py-3">Credencial / Acceso</th>
                <th className="px-4 py-3">Rol Asignado</th>
                <th className="px-4 py-3 hidden md:table-cell">Fecha de Registro</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda o filtro aplicado.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-semibold text-xs flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800/60">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.nombre_completo}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-1.5 py-0.2 rounded font-medium">
                                  Tú
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                              ID: {u.id_usuario.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Credencial / Correo */}
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.credencial_acceso}</span>
                        </div>
                      </td>

                      {/* Rol con Badge Estándar */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${getRoleBadgeClasses(
                            u.rol
                          )}`}
                        >
                          {getRoleIcon(u.rol)}
                          <span>{u.rol}</span>
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="px-4 py-3 hidden md:table-cell text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Editar usuario o rol"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                                : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
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

        {/* Paginación */}
        {filteredUsers.length > 0 && (
          <TablePagination
            currentPage={safeCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(num) => {
              setItemsPerPage(num);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Modales de Personal */}
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
