import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * API Endpoint for creating clinics (Super Admin only)
 * POST /api/clinics/create
 *
 * Body:
 * - name: string (required)
 * - slug: string (required)
 * - email: string (optional)
 * - phone: string (optional)
 * - city: string (optional)
 * - state: string (optional)
 * - country: string (optional, default: 'MX')
 * - subscription_tier: string (required)
 * - manager_name: string (required)
 * - manager_email: string (required)
 * - manager_password: string (required)
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

    // Verify the requestor is a super admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestor }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', requestor.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({
        error: 'Forbidden: Only super admins can create clinics'
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      slug,
      email,
      phone,
      city,
      state,
      country = 'MX',
      subscription_tier,
      manager_name,
      manager_email,
      manager_password,
    } = body;

    // Validate required fields
    if (!name || !slug || !subscription_tier || !manager_name || !manager_email || !manager_password) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['name', 'slug', 'subscription_tier', 'manager_name', 'manager_email', 'manager_password']
      }, { status: 400 });
    }

    // Step 1: Create clinic
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .insert({
        name,
        slug,
        email,
        phone,
        city,
        state,
        country,
        subscription_tier,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
      })
      .select()
      .single();

    if (clinicError) {
      console.error('Error creating clinic:', clinicError);
      return NextResponse.json({
        error: 'Error creating clinic',
        details: clinicError.message
      }, { status: 500 });
    }

    // Step 2: Create manager user in Supabase Auth
    const { data: authData, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
      email: manager_email,
      password: manager_password,
      email_confirm: true,
      user_metadata: {
        full_name: manager_name,
      },
    });

    if (authUserError) {
      console.error('Error creating manager user:', authUserError);
      // Rollback clinic creation
      await supabaseAdmin.from('clinics').delete().eq('id', clinic.id);
      return NextResponse.json({
        error: 'Error creating manager user',
        details: authUserError.message
      }, { status: 500 });
    }

    // Step 3: Create user profile for manager
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        role: 'clinic_manager',
        clinic_id: clinic.id,
        full_name: manager_name,
        professional_title: 'Encargado de Clínica',
        is_active: true,
      });

    if (profileError) {
      console.error('Error creating manager profile:', profileError);
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('clinics').delete().eq('id', clinic.id);
      return NextResponse.json({
        error: 'Error creating manager profile',
        details: profileError.message
      }, { status: 500 });
    }

    // Step 4: Assign role in user_roles table (if it exists)
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'clinic_manager')
      .single();

    if (roleData) {
      await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: roleData.id,
        });
    }

    // Return success with explicit clinic data
    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        email: clinic.email,
        subscription_tier: clinic.subscription_tier,
        subscription_status: clinic.subscription_status,
        trial_ends_at: clinic.trial_ends_at,
        is_active: clinic.is_active,
      },
      manager: {
        id: authData.user.id,
        email: manager_email,
        name: manager_name,
      },
      message: 'Clínica creada exitosamente'
    });

  } catch (error: any) {
    console.error('Error in create clinic endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
