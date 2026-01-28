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

        // 3. Create Auth User
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: therapist.email,
            email_confirm: true, // We will send our own invite link, so confirm email to avoid double verification issues or use standard flow
            user_metadata: {
                first_name: therapist.first_name,
                last_name: therapist.last_name,
                role: UserRole.THERAPIST,
                clinic_id: therapist.clinic_id,
            },
            app_metadata: {
                role: UserRole.THERAPIST,
                clinic_id: therapist.clinic_id,
            },
        });

        if (createUserError) {
            // If user already exists (maybe created manually?), try to link
            // But for now, return error
            return { success: false, error: createUserError.message };
        }

        // 4. Assign Role
        const { data: roleData } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', UserRole.THERAPIST)
            .single();

        if (roleData) {
            await supabaseAdmin.from('user_roles').insert({
                user_id: newUser.user.id,
                role_id: roleData.id,
            });
        }

        // 5. Update Therapist Record
        await supabaseAdmin
            .from('therapists')
            .update({ auth_user_id: newUser.user.id })
            .eq('id', therapistId);

        // 6. Update User Profile (to ensure sync)
        await supabaseAdmin.from('user_profiles').upsert({
            id: newUser.user.id,
            role: UserRole.THERAPIST,
            clinic_id: therapist.clinic_id,
            full_name: `${therapist.first_name} ${therapist.last_name}`,
            professional_title: 'Fisioterapeuta' // Should import getRoleTitle but hardcoding for simplicity/speed
        });

        // 7. Send Invite Email
        // Generate Link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: therapist.email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`,
            }
        });

        if (linkError) throw linkError;

        // Send via Resend
        if (process.env.RESEND_API_KEY) {
            const { sendEmail, emailTemplates } = await import('@/lib/email');
            // Fetch clinic name if possible, or default
            const { data: clinic } = await supabaseAdmin.from('clinics').select('name').eq('id', therapist.clinic_id).single();

            await sendEmail({
                to: therapist.email,
                ...emailTemplates.invitationEmail(
                    therapist.first_name,
                    clinic?.name || 'Clínica',
                    linkData.properties.action_link
                )
            });
        } else {
            // Fallback or warning
            console.warn('RESEND_API_KEY missing, falling back to Supabase standard invite');
            await supabaseAdmin.auth.admin.inviteUserByEmail(therapist.email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`,
            });
        }

        return { success: true };

    } catch (error: any) {
        console.error('Invite error:', error);
        return { success: false, error: error.message };
    }
}
