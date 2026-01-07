import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { UserRole } from '@/types/roles';

/**
 * API Endpoint for creating users of any role
 * POST /api/users/create
 *
 * Body:
 * - email: string (required)
 * - role: UserRole (required)
 * - first_name: string (required)
 * - last_name: string (required)
 * - sendInvite: boolean (optional, default: true)
 * - additionalData: object (optional, role-specific data)
 */
export async function POST(request: Request) {
  try {
    // Create Supabase client with service role for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const {
      email,
      role,
      first_name,
      last_name,
      sendInvite = true,
      additionalData = {}
    } = body;

    // Validate required fields
    if (!email || !role || !first_name || !last_name) {
      return NextResponse.json({
        error: 'Email, role, first_name, and last_name are required'
      }, { status: 400 });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({
        error: 'Invalid role',
        validRoles: Object.values(UserRole)
      }, { status: 400 });
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
      email_confirm: !sendInvite,
      user_metadata: {
        first_name,
        last_name,
        role,
        ...additionalData
      },
      app_metadata: {
        role,
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json({
        error: 'Error al crear la cuenta de usuario',
        details: createUserError.message
      }, { status: 500 });
    }

    // Assign role in user_roles table
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleData) {
      const { error: roleAssignError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role_id: roleData.id,
        });

      if (roleAssignError) {
        console.error('Error assigning role:', roleAssignError);
      }
    }

    // Create role-specific records
    let roleSpecificRecord = null;
    let roleSpecificError = null;

    switch (role) {
      case UserRole.THERAPIST:
        // Create therapist record
        const { data: therapistData, error: therapistError } = await supabaseAdmin
          .from('therapists')
          .insert({
            auth_user_id: newUser.user.id,
            first_name,
            last_name,
            email,
            role: UserRole.THERAPIST,
            status: additionalData.status || 'active',
            specialization: additionalData.specialization || null,
            license_number: additionalData.license_number || null,
            phone: additionalData.phone || null,
            certifications: additionalData.certifications || [],
          })
          .select()
          .single();

        roleSpecificRecord = therapistData;
        roleSpecificError = therapistError;
        break;

      case UserRole.PATIENT:
        // Create patient record
        const { data: patientData, error: patientError } = await supabaseAdmin
          .from('patients')
          .insert({
            auth_user_id: newUser.user.id,
            first_name,
            last_name,
            email,
            phone: additionalData.phone || null,
            date_of_birth: additionalData.date_of_birth || null,
            address: additionalData.address || null,
            emergency_contact_name: additionalData.emergency_contact_name || null,
            emergency_contact_phone: additionalData.emergency_contact_phone || null,
            medical_history: additionalData.medical_history || null,
            primary_therapist_id: additionalData.primary_therapist_id || null,
          })
          .select()
          .single();

        roleSpecificRecord = patientData;
        roleSpecificError = patientError;
        break;

      case UserRole.ADMIN:
      case UserRole.RECEPTIONIST:
        // For admin and receptionist, we might want a staff table
        // For now, they only exist in auth.users and user_roles
        // You can extend this later if needed
        break;
    }

    if (roleSpecificError) {
      console.error(`Error creating ${role} record:`, roleSpecificError);
      return NextResponse.json({
        warning: `Usuario creado pero registro de ${role} no se pudo crear`,
        userId: newUser.user.id,
        error: roleSpecificError.message
      }, { status: 200 });
    }

    // Send invitation email if requested
    if (sendInvite && newUser.user.email) {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        newUser.user.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`,
        }
      );

      if (inviteError) {
        console.error('Error sending invite:', inviteError);
        return NextResponse.json({
          success: true,
          userId: newUser.user.id,
          roleSpecificRecord,
          inviteSent: false,
          message: 'Usuario creado pero no se pudo enviar el email de invitación'
        });
      }
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      role,
      roleSpecificRecord,
      inviteSent: sendInvite,
      message: sendInvite
        ? 'Usuario creado e invitación enviada'
        : 'Usuario creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error in create user endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
