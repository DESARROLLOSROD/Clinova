import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Get all user profiles with their clinic info
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

    // Get emails from auth.users using service role
    const users = [];

    for (const profile of userProfiles || []) {
      // Query auth.users to get email
      const { data: authUserData } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', profile.id)
        .single();

      const fullNameParts = profile.full_name?.split(' ') || [];
      const firstName = fullNameParts[0] || '';
      const lastName = fullNameParts.slice(1).join(' ') || '';

      users.push({
        id: profile.id,
        email: authUserData?.email || 'Sin email',
        full_name: profile.full_name,
        first_name: firstName,
        last_name: lastName,
        role: profile.role,
        phone: profile.phone,
        is_active: profile.is_active,
        clinic_name: (profile.clinics as any)?.name || 'Sin clínica',
        created_at: profile.created_at,
      });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in /api/users/list:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
