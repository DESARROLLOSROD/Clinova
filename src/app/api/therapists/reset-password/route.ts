import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        error: 'Email is required'
      }, { status: 400 });
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-password`,
    });

    if (resetError) {
      console.error('Error sending password reset:', resetError);
      return NextResponse.json({
        error: 'Failed to send password reset email',
        details: resetError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error: any) {
    console.error('Error in reset-password endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
