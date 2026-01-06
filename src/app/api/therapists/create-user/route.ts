import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    const { therapistId, email, sendInvite = true } = body;

    if (!therapistId || !email) {
      return NextResponse.json({
        error: 'Therapist ID and email are required'
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

    // Create user in Supabase Auth
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: !sendInvite, // Auto-confirm if not sending invite
      user_metadata: {
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        role: 'therapist',
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json({
        error: 'Error al crear la cuenta de usuario',
        details: createUserError.message
      }, { status: 500 });
    }

    // Update therapist record with auth user ID
    const { error: updateError } = await supabaseAdmin
      .from('therapists')
      .update({
        auth_user_id: newUser.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', therapistId);

    if (updateError) {
      console.error('Error updating therapist:', updateError);
      // User was created but therapist not updated - log this
      return NextResponse.json({
        warning: 'Usuario creado pero registro de fisioterapeuta no actualizado',
        userId: newUser.user.id
      }, { status: 200 });
    }

    // Send invitation email if requested
    if (sendInvite && newUser.user.email) {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        newUser.user.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/setup-password`,
        }
      );

      if (inviteError) {
        console.error('Error sending invite:', inviteError);
        return NextResponse.json({
          success: true,
          userId: newUser.user.id,
          inviteSent: false,
          message: 'Usuario creado pero no se pudo enviar el email de invitación'
        });
      }
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      inviteSent: sendInvite,
      message: sendInvite
        ? 'User account created and invitation sent'
        : 'User account created successfully'
    });

  } catch (error: any) {
    console.error('Error in create-user endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
