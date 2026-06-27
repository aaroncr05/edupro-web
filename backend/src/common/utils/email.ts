import { Resend } from 'resend'

// Sin dominio verificado en Resend usar onboarding@resend.dev
// Una vez verificado el dominio, cambiar a: "EduPro CRM <noreply@tudominio.com>"
const FROM = 'EduPro CRM <onboarding@resend.dev>'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: Buffer }>
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY no configurado en variables de entorno.')

  const resend = new Resend(apiKey)
  const replyTo = options.replyTo || process.env.EMAIL_FROM

  const { error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    attachments: options.attachments?.map(a => ({
      filename: a.filename,
      content: a.content.toString('base64')
    })),
    ...(replyTo ? { replyTo } : {})
  })

  if (error) {
    throw new Error(error.message || 'Error al enviar email')
  }
}
