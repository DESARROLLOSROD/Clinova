'use server';

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/roles';

export async function invitePatient(patientId: string) {
    try {
        // 1. Setup Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return { success: false, error: 'Server configuration error' };
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 2. Fetch Patient Details
        const { data: patient, error: fetchError } = await supabaseAdmin
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();

        if (fetchError || !patient) {
            return { success: false, error: 'Paciente no encontrado' };
        }

        if (patient.auth_user_id) {
            return { success: false, error: 'El paciente ya tiene acceso' };
        }

        if (!patient.email) {
            return { success: false, error: 'El paciente no tiene email registrado' };
        }

        // 3. Create Auth User and Send Invite Email via Supabase
        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`;

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(patient.email, {
            data: {
                first_name: patient.first_name,
                last_name: patient.last_name,
                role: UserRole.PATIENT,
                clinic_id: patient.clinic_id,
            },
            redirectTo,
        });

        if (inviteError) {
            return { success: false, error: inviteError.message };
        }

        const userId = inviteData.user.id;

        // 4. Set app_metadata (not settable via inviteUserByEmail)
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: {
                role: UserRole.PATIENT,
                clinic_id: patient.clinic_id,
            },
        });

        // 5. Assign Role
        const { data: roleData } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', UserRole.PATIENT)
            .single();

        if (roleData) {
            await supabaseAdmin.from('user_roles').insert({
                user_id: userId,
                role_id: roleData.id,
            });
        }

        // 6. Update Patient Record
        await supabaseAdmin
            .from('patients')
            .update({ auth_user_id: userId })
            .eq('id', patientId);

        // 7. Update User Profile (to ensure sync)
        await supabaseAdmin.from('user_profiles').upsert({
            id: userId,
            role: UserRole.PATIENT,
            clinic_id: patient.clinic_id,
            full_name: `${patient.first_name} ${patient.last_name}`,
        });

        return { success: true };

    } catch (error: any) {
        console.error('Patient invite error:', error);
        return { success: false, error: error.message };
    }
}
