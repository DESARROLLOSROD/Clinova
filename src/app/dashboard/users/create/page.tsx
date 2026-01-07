import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdmin, isStaff } from '@/utils/roles';
import CreateUserForm from '@/components/users/CreateUserForm';

export const metadata: Metadata = {
  title: 'Crear Usuario | Clinova',
  description: 'Crear nuevo usuario en el sistema',
};

export default async function CreateUserPage() {
  // Only admins and staff can access this page
  const canAccess = await isStaff();

  if (!canAccess) {
    redirect('/dashboard');
  }

  const adminAccess = await isAdmin();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
        <p className="text-gray-600 mt-2">
          Complete el formulario para crear un nuevo usuario en el sistema
        </p>
      </div>

      <CreateUserForm
        hideRoleSelection={!adminAccess} // Only admins can choose role
        onSuccess={(userId, role) => {
          // Redirect based on role
          if (role === 'therapist') {
            window.location.href = '/dashboard/therapists';
          } else if (role === 'patient') {
            window.location.href = '/dashboard/patients';
          } else {
            window.location.href = '/dashboard/users';
          }
        }}
        onCancel={() => {
          window.history.back();
        }}
      />
    </div>
  );
}
