import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { UserRole } from '@/types/roles';
import { getRoleTitle } from '@/utils/roleHelpers';

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
      password,
      sendInvite = false,
      additionalData = {}
    } = body;

    // Get the user performing the request to determine clinic_id
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false }
    });

    // Check authentication and get requestor profile
    // Note: Since this is an API route, we rely on the header or session passed
    // But since we are using supabase-js client side, the proper way is usually to pass the access token
    // For now in Next.js App Router we can use createClient from utils/supabase/server
    // However, this code uses a manual admin client. 

    // Let's get the authorization header manually
    const authHeader = request.headers.get('Authorization');
    let requestorClinicId = null;
    let isSuperAdmin = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: requestor }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (!authError && requestor) {
        // Get profile to check role and clinic
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('role, clinic_id')
          .eq('id', requestor.id)
          .single();

        if (profile) {
          isSuperAdmin = profile.role === 'super_admin';
          requestorClinicId = profile.clinic_id;

          // If clinic manager tries to create user, enforce clinic_id
          if (!isSuperAdmin && profile.role === 'clinic_manager') {
            // Force the clinic_id
            additionalData.clinic_id = requestorClinicId;
          } else if (!isSuperAdmin) {
            // Other roles shouldn't be here (middleware blocks them), but just in case
            return NextResponse.json({ error: 'Unauthorized to create users' }, { status: 403 });
          }
        }
      }
    }

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

    // Create user in Supabase Auth with password (no email invite needed)
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password || undefined,
      email_confirm: true, // Auto-confirm so they can log in immediately
      user_metadata: {
        first_name,
        last_name,
        role,
        clinic_id: additionalData.clinic_id || null,
      },
      app_metadata: {
        role,
        clinic_id: additionalData.clinic_id || null,
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

    // Explicitly update user_profiles to ensure clinic_id and role are correct
    // (This is robust against trigger failures or misconfiguration)
    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role: role,
        clinic_id: additionalData.clinic_id || null,
        professional_title: additionalData.professional_title || getRoleTitle(role),
        full_name: `${first_name} ${last_name}`
      })
      .eq('id', newUser.user.id);

    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError);
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
            clinic_id: additionalData.clinic_id,
            first_name,
            last_name,
            email,
            role: UserRole.THERAPIST,
            status: additionalData.status || 'active',
            specialization: additionalData.specialization || null,
            license_number: additionalData.license_number || null,
            phone: additionalData.phone || null,
            address: additionalData.address || null,
            city: additionalData.city || null,
            state: additionalData.state || null,
            postal_code: additionalData.postal_code || null,
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
            clinic_id: additionalData.clinic_id,
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

      case UserRole.CLINIC_MANAGER:
      case UserRole.RECEPTIONIST:
        // For clinic_manager and receptionist, we might want a staff table
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

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      role,
      roleSpecificRecord,
      message: 'Usuario creado exitosamente. Ya puede iniciar sesión con su email y contraseña.'
    });

  } catch (error: any) {
    console.error('Error in create user endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
