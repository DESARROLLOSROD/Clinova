import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

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

    const body = await request.json()
    const { notificationId, email, subject, html, text } = body

    // Option 1: Send notification by ID (from database)
    if (notificationId) {
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (fetchError || !notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }

      // Check if Resend is configured
      if (!process.env.RESEND_API_KEY) {
        console.log('Email service not configured. Would send:', {
          to: notification.recipient_email,
          subject: notification.subject,
          body: notification.body,
        })
        return NextResponse.json({
          success: true,
          message: 'Notification logged (email service not configured)',
        })
      }

      // Send email using Resend
      const result = await sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        html: notification.body.replace(/\n/g, '<br>'),
        text: notification.body,
      })

      // Update notification as sent
      await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notificationId)

      return NextResponse.json({
        success: true,
        emailId: result.id,
        message: 'Email sent successfully',
      })
    }

    // Option 2: Send direct email (not from database)
    if (email && subject && html) {
      if (!process.env.RESEND_API_KEY) {
        console.log('Email service not configured. Would send:', { to: email, subject })
        return NextResponse.json({
          success: true,
          message: 'Email logged (service not configured)',
        })
      }

      const result = await sendEmail({
        to: email,
        subject,
        html,
        text,
      })

      return NextResponse.json({
        success: true,
        emailId: result.id,
        message: 'Email sent successfully',
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
