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
      const supabase = createClient();

      // Get all users from user_roles table joined with auth.users
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            name
          )
        `);

      if (userRolesError) throw userRolesError;

      // Create a map of user_id to role
      const userRolesMap = new Map<string, UserRole>();
      userRolesData?.forEach((ur: any) => {
        if (ur.roles?.name) {
          userRolesMap.set(ur.user_id, ur.roles.name as UserRole);
        }
      });

      // Get user data from therapists and patients tables
      const { data: therapistsData } = await supabase
        .from('therapists')
        .select('auth_user_id, first_name, last_name, email, created_at, role')
        .not('auth_user_id', 'is', null);

      const { data: patientsData } = await supabase
        .from('patients')
        .select('auth_user_id, first_name, last_name, email, created_at')
        .not('auth_user_id', 'is', null);

      // Combine data
      const allUsers: UserListItem[] = [];

      // Add therapists
      therapistsData?.forEach((therapist: any) => {
        allUsers.push({
          id: therapist.auth_user_id,
          email: therapist.email,
          created_at: therapist.created_at,
          user_metadata: {
            first_name: therapist.first_name,
            last_name: therapist.last_name,
            role: therapist.role || userRolesMap.get(therapist.auth_user_id),
          },
          role: therapist.role || userRolesMap.get(therapist.auth_user_id),
        });
      });

      // Add patients
      patientsData?.forEach((patient: any) => {
        allUsers.push({
          id: patient.auth_user_id,
          email: patient.email,
          created_at: patient.created_at,
          user_metadata: {
            first_name: patient.first_name,
            last_name: patient.last_name,
            role: userRolesMap.get(patient.auth_user_id),
          },
          role: userRolesMap.get(patient.auth_user_id),
        });
      });

      // Sort by creation date (newest first)
      allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.THERAPIST]: 'Fisioterapeuta',
      [UserRole.RECEPTIONIST]: 'Recepcionista',
      [UserRole.PATIENT]: 'Paciente',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role?: UserRole): string => {
    if (!role) return 'bg-gray-100 text-gray-800';
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.THERAPIST]: 'bg-blue-100 text-blue-800',
      [UserRole.RECEPTIONIST]: 'bg-green-100 text-green-800',
      [UserRole.PATIENT]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
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
        <div className="text-gray-600">Cargando usuarios...</div>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los roles</option>
          <option value={UserRole.ADMIN}>Administradores</option>
          <option value={UserRole.THERAPIST}>Fisioterapeutas</option>
          <option value={UserRole.RECEPTIONIST}>Recepcionistas</option>
          <option value={UserRole.PATIENT}>Pacientes</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Usuarios</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === UserRole.THERAPIST).length}
          </div>
          <div className="text-sm text-gray-600">Fisioterapeutas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.role === UserRole.RECEPTIONIST).length}
          </div>
          <div className="text-sm text-gray-600">Recepcionistas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter((u) => u.role === UserRole.PATIENT).length}
          </div>
          <div className="text-sm text-gray-600">Pacientes</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.user_metadata.first_name || ''} {user.user_metadata.last_name || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      Ver
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
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
