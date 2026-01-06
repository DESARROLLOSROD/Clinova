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
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Fetch the notification details
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Here you would integrate with an email service (SendGrid, Resend, etc.)
    // For now, we'll just log it and mark as sent
    console.log('Sending email notification:', {
      to: notification.recipient_email,
      subject: notification.subject,
      body: notification.body,
    });

    // In production, replace this with actual email sending:
    // await sendEmail({
    //   to: notification.recipient_email,
    //   subject: notification.subject,
    //   html: notification.body.replace(/\n/g, '<br>'),
    // });

    return NextResponse.json({
      success: true,
      message: 'Notification logged (email service not configured)'
    });

  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json({
      error: 'Failed to send notification',
      details: error.message
    }, { status: 500 });
  }
}
