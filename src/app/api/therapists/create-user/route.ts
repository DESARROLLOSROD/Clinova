import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { UserRole } from '@/types/roles';

export async function POST(request: Request) {
  try {
    // Create Supabase client with service role for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing Supabase credentials. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local'
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { therapistId, email, password, sendInvite = false, role = UserRole.THERAPIST } = body;

    if (!therapistId || !email) {
      return NextResponse.json({
        error: 'Therapist ID and email are required'
      }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({
        error: 'La contraseña es obligatoria y debe tener al menos 6 caracteres'
      }, { status: 400 });
    }

    // Verify therapist exists
    const { data: therapist, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .select('*')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      return NextResponse.json({
        error: 'Therapist not found'
      }, { status: 404 });
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === email);

    if (userExists) {
      return NextResponse.json({
        error: 'Ya existe un usuario con este email',
        userExists: true
      }, { status: 409 });
    }

    // Create user in Supabase Auth with password (no email invite needed)
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm so they can log in immediately
      user_metadata: {
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        role: role,
        clinic_id: therapist.clinic_id || null,
      },
      app_metadata: {
        role: role,
        clinic_id: therapist.clinic_id || null,
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json({
        error: 'Error al crear la cuenta de usuario',
        details: createUserError.message
      }, { status: 500 });
    }

    // Update therapist record with auth user ID and role
    const { error: updateError } = await supabaseAdmin
      .from('therapists')
      .update({
        auth_user_id: newUser.user.id,
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', therapistId);

    if (updateError) {
      console.error('Error updating therapist:', updateError);
      return NextResponse.json({
        warning: 'Usuario creado pero registro de fisioterapeuta no actualizado',
        userId: newUser.user.id
      }, { status: 200 });
    }

    // Assign role in user_roles table
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleData) {
      await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role_id: roleData.id,
        });
    }

    // Update user_profiles to ensure clinic_id and role are correct
    await supabaseAdmin
      .from('user_profiles')
      .update({
        role: role,
        clinic_id: therapist.clinic_id || null,
        full_name: `${therapist.first_name} ${therapist.last_name}`,
      })
      .eq('id', newUser.user.id);

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      message: 'Cuenta creada exitosamente. Ya puede iniciar sesión con su email y contraseña.'
    });

  } catch (error: any) {
    console.error('Error in create-user endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
