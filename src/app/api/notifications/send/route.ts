import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { sendPushNotificationToUser } from '@/lib/push-notifications-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for cross-user operations (inserting notifications for other users)
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const { notificationId, userId, email, subject, html, text } = body

    let pushResult = null;

    // Option 1: Send notification by ID (already in database)
    if (notificationId) {
      const { data: notification, error: fetchError } = await adminSupabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (fetchError || !notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }

      // Send push if user has devices
      if (notification.user_id) {
        pushResult = await sendPushNotificationToUser(
          notification.user_id,
          notification.title || 'Nueva Notificación',
          notification.message || 'Tienes un nuevo mensaje'
        );
      }

      return NextResponse.json({
        success: true,
        pushResult,
        message: 'Notification sent',
      })
    }

    // Option 2: Send direct notification (save to DB + push + email)
    if ((email || userId) && subject) {

      // Save to notifications table so it shows in the bell (admin client bypasses RLS)
      if (userId) {
        const { error: insertError } = await adminSupabase.from('notifications').insert({
          user_id: userId,
          title: subject,
          message: text || 'Nuevas actualizaciones en Clinova',
          type: 'info',
        });

        if (insertError) {
          console.error('Error inserting notification:', insertError);
        }

        // Send push notification to device
        pushResult = await sendPushNotificationToUser(
          userId,
          subject,
          text || 'Nuevas actualizaciones en Clinova'
        );
      }

      // Send email if configured
      if (email) {
        if (!process.env.RESEND_API_KEY) {
          console.log('Email service not configured. Would send:', { to: email, subject })
          return NextResponse.json({
            success: true,
            pushResult,
            message: 'Notification saved and push sent (email service not configured)',
          })
        }

        const result = await sendEmail({
          to: email,
          subject,
          html: html || text || '',
          text: text || '',
        })

        return NextResponse.json({
          success: true,
          emailId: result.id,
          pushResult,
          message: 'Notification sent successfully',
        })
      }

      return NextResponse.json({
        success: true,
        pushResult,
        message: 'Notification processed',
      })
    }

    return NextResponse.json(
      { error: 'Either notificationId or email/subject/html is required' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Error sending notification:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
