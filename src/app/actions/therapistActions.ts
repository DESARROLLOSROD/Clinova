'use server';

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/roles';

export async function inviteTherapist(therapistId: string) {
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

        // 2. Fetch Therapist Details
        const { data: therapist, error: fetchError } = await supabaseAdmin
            .from('therapists')
            .select('*')
            .eq('id', therapistId)
            .single();

        if (fetchError || !therapist) {
            return { success: false, error: 'Therapist not found' };
        }

        if (therapist.auth_user_id) {
            return { success: false, error: 'User already has access' };
        }

        if (!therapist.email) {
            return { success: false, error: 'Therapist has no email' };
        }

        // 3. Create Auth User and Send Invite Email via Supabase
        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`;

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(therapist.email, {
            data: {
                first_name: therapist.first_name,
                last_name: therapist.last_name,
                role: UserRole.THERAPIST,
                clinic_id: therapist.clinic_id,
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
                role: UserRole.THERAPIST,
                clinic_id: therapist.clinic_id,
            },
        });

        // 5. Assign Role
        const { data: roleData } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', UserRole.THERAPIST)
            .single();

        if (roleData) {
            await supabaseAdmin.from('user_roles').insert({
                user_id: userId,
                role_id: roleData.id,
            });
        }

        // 6. Update Therapist Record
        await supabaseAdmin
            .from('therapists')
            .update({ auth_user_id: userId })
            .eq('id', therapistId);

        // 7. Update User Profile (to ensure sync)
        await supabaseAdmin.from('user_profiles').upsert({
            id: userId,
            role: UserRole.THERAPIST,
            clinic_id: therapist.clinic_id,
            full_name: `${therapist.first_name} ${therapist.last_name}`,
            professional_title: 'Fisioterapeuta',
        });

        return { success: true };

    } catch (error: any) {
        console.error('Invite error:', error);
        return { success: false, error: error.message };
    }
}
