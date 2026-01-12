import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'clinic_manager')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Get user profiles
    // RLS will automatically filter this for clinic_manager
    // Super admin will see all
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role,
        full_name,
        phone,
        is_active,
        created_at,
        clinics (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json(
        { error: 'Error al obtener perfiles de usuario' },
        { status: 500 }
      );
    }

    // Create admin client to fetch emails
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Optimize: Fetch all users from Auth (if possible) or just map what we have
    // Since we need emails which are only in Auth, and we can't join in Supabase

    // Efficiently fetch user data in parallel
    const usersWithEmail = await Promise.all(
      (userProfiles || []).map(async (p) => {
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(p.id);

        const fullNameParts = p.full_name?.split(' ') || [];
        const firstName = fullNameParts[0] || '';
        const lastName = fullNameParts.slice(1).join(' ') || '';

        return {
          id: p.id,
          email: authUser?.email || 'Sin email',
          full_name: p.full_name,
          first_name: firstName,
          last_name: lastName,
          role: p.role,
          phone: p.phone,
          is_active: p.is_active,
          clinic_name: (p.clinics as any)?.name || 'Sin clínica',
          created_at: p.created_at,
        };
      })
    );

    return NextResponse.json({ users: usersWithEmail });
  } catch (error: any) {
    console.error('Error in /api/users/list:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
