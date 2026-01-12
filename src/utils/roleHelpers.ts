import { UserRole } from '@/types/roles';

export function getRoleTitle(role: string): string {
    switch (role) {
        case UserRole.SUPER_ADMIN: return 'Administrador de Plataforma';
        case UserRole.CLINIC_MANAGER: return 'Encargado de Clínica';
        case UserRole.THERAPIST: return 'Fisioterapeuta';
        case UserRole.RECEPTIONIST: return 'Recepcionista';
        case UserRole.PATIENT: return 'Paciente';
        default: return 'Usuario';
    }
}
