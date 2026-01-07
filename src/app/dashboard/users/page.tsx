import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/utils/roles';
import { createClient } from '@/utils/supabase/server';
import UsersList from '@/components/users/UsersList';

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | Clinova',
  description: 'Gestionar usuarios del sistema',
};

export default async function UsersPage() {
  // Only admins can access this page
  if (!(await isAdmin())) {
    redirect('/dashboard');
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Administrar todos los usuarios del sistema
          </p>
        </div>

        <Link
          href="/dashboard/users/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Crear Usuario
        </Link>
      </div>

      <UsersList />
    </div>
  );
}
