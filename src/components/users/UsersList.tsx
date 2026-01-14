'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserRole } from '@/types/roles';

interface UserListItem {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: UserRole;
  };
  role?: UserRole;
}

export default function UsersList() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call API endpoint to get users
      const response = await fetch('/api/users/list');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar usuarios');
      }

      const { users: usersData } = await response.json();

      // Transform data to match UserListItem interface
      const allUsers: UserListItem[] = usersData.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role as UserRole,
        },
        role: user.role as UserRole,
      }));

      setUsers(allUsers);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role?: UserRole): string => {
    if (!role) return 'Sin rol';
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Administrador',
      [UserRole.CLINIC_MANAGER]: 'Encargado de Clínica',
      [UserRole.THERAPIST]: 'Fisioterapeuta',
      [UserRole.RECEPTIONIST]: 'Recepcionista',
      [UserRole.PATIENT]: 'Paciente',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role?: UserRole): string => {
    if (!role) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    const colors: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400',
      [UserRole.CLINIC_MANAGER]: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400',
      [UserRole.THERAPIST]: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400',
      [UserRole.RECEPTIONIST]: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400',
      [UserRole.PATIENT]: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400',
    };
    return colors[role] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const filteredUsers = users.filter((user) => {
    // Filter by role
    if (filterRole !== 'all' && user.role !== filterRole) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.toLowerCase();
      const email = user.email.toLowerCase();

      if (!fullName.includes(query) && !email.includes(query)) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los roles</option>
          <option value={UserRole.CLINIC_MANAGER}>Encargados</option>
          <option value={UserRole.THERAPIST}>Fisioterapeutas</option>
          <option value={UserRole.RECEPTIONIST}>Recepcionistas</option>
          <option value={UserRole.PATIENT}>Pacientes</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter((u) => u.role === UserRole.THERAPIST).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Fisioterapeutas</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter((u) => u.role === UserRole.RECEPTIONIST).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Recepcionistas</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {users.filter((u) => u.role === UserRole.PATIENT).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pacientes</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.user_metadata.first_name || ''} {user.user_metadata.last_name || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
                      Ver
                    </button>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
