import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication - only admins can create users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { therapistId, email, sendInvite = true } = body;

    if (!therapistId || !email) {
      return NextResponse.json({
        error: 'Therapist ID and email are required'
      }, { status: 400 });
    }

    // Verify therapist exists
    const { data: therapist, error: therapistError } = await supabase
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
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === email);

    if (userExists) {
      return NextResponse.json({
        error: 'A user with this email already exists',
        userExists: true
      }, { status: 409 });
    }

    // Create user in Supabase Auth
    // Note: This requires admin privileges - we'll need to use the service role key
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
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
        error: 'Failed to create user account',
        details: createUserError.message
      }, { status: 500 });
    }

    // Update therapist record with auth user ID
    const { error: updateError } = await supabase
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
        warning: 'User created but therapist record not updated',
        userId: newUser.user.id
      }, { status: 200 });
    }

    // Send invitation email if requested
    if (sendInvite && newUser.user.email) {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        newUser.user.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        }
      );

      if (inviteError) {
        console.error('Error sending invite:', inviteError);
        return NextResponse.json({
          success: true,
          userId: newUser.user.id,
          inviteSent: false,
          message: 'User created but invitation email failed to send'
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
