import { Resend } from 'resend'

// Default sender email (configure in Resend dashboard)
const FROM_EMAIL = process.env.EMAIL_FROM || 'Clinova <noreply@clinova.com>'

// Lazy initialization of Resend client
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailParams) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('Resend API key not configured. Email not sent:', { to, subject })
    return { success: false, id: null, message: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error(error.message)
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  appointmentReminder: (patientName: string, date: string, time: string, therapistName: string) => ({
    subject: 'Recordatorio de cita - Clinova',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Recordatorio de Cita</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${patientName}</strong>,</p>
            <p>Te recordamos que tienes una cita programada:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
              <p style="margin: 5px 0;"><strong>Fisioterapeuta:</strong> ${therapistName}</p>
            </div>
            <p>Si necesitas reprogramar o cancelar tu cita, por favor contáctanos con anticipación.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de Clinova
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${patientName}, te recordamos que tienes una cita programada para el ${date} a las ${time} con ${therapistName}.`,
  }),

  appointmentConfirmation: (patientName: string, date: string, time: string, therapistName: string, clinicName: string) => ({
    subject: 'Cita confirmada - Clinova',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Cita Confirmada</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${patientName}</strong>,</p>
            <p>Tu cita ha sido confirmada exitosamente en <strong>${clinicName}</strong>.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
              <p style="margin: 5px 0;"><strong>Fisioterapeuta:</strong> ${therapistName}</p>
            </div>
            <p>Te esperamos. Por favor, llega 5 minutos antes de tu cita.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de ${clinicName}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${patientName}, tu cita ha sido confirmada para el ${date} a las ${time} con ${therapistName} en ${clinicName}.`,
  }),

  appointmentCancellation: (patientName: string, date: string, time: string, clinicName: string) => ({
    subject: 'Cita cancelada - Clinova',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Cita Cancelada</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${patientName}</strong>,</p>
            <p>Te informamos que tu cita ha sido cancelada.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            <p>Si deseas reprogramar tu cita, por favor contáctanos.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de ${clinicName}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${patientName}, tu cita programada para el ${date} a las ${time} ha sido cancelada. Si deseas reprogramar, contáctanos.`,
  }),

  welcomeUser: (userName: string, clinicName: string, loginUrl: string) => ({
    subject: `Bienvenido a ${clinicName} - Clinova`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡Bienvenido a Clinova!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Tu cuenta ha sido creada exitosamente en <strong>${clinicName}</strong>.</p>
            <p>Ya puedes acceder a la plataforma para gestionar tus citas, ver tus ejercicios y más.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                Acceder a Clinova
              </a>
            </div>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de ${clinicName}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${userName}, tu cuenta ha sido creada en ${clinicName}. Accede a Clinova en: ${loginUrl}`,
  }),

  paymentReceipt: (patientName: string, amount: string, concept: string, date: string, clinicName: string) => ({
    subject: `Recibo de pago - ${clinicName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Recibo de Pago</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${patientName}</strong>,</p>
            <p>Hemos recibido tu pago. A continuación los detalles:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 5px 0;"><strong>Concepto:</strong> ${concept}</p>
              <p style="margin: 5px 0;"><strong>Monto:</strong> ${amount}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
            </div>
            <p>Gracias por tu confianza.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de ${clinicName}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${patientName}, hemos recibido tu pago de ${amount} por ${concept} el ${date}. Gracias.`,
  }),

  invitationEmail: (userName: string, clinicName: string, inviteUrl: string) => ({
    subject: `Invitación a ${clinicName} - Clinova`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Te han invitado a Clinova</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Se ha creado una cuenta para ti en <strong>${clinicName}</strong>.</p>
            <p>Para completar tu registro y establecer tu contraseña, haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                Activar mi Cuenta
              </a>
            </div>
            <p style="font-size: 12px; color: #888;">Este enlace expirará en 24 horas.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Saludos,<br>
              El equipo de ${clinicName}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hola ${userName}, has sido invitado a unirte a ${clinicName}. Activa tu cuenta aquí: ${inviteUrl}`,
  })
}
