import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: 'TeachersBoost <noreply@teachersboost.com>',
    to: email,
    subject: 'Confirm your TeachersBoost account',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">
          Welcome to TeachersBoost! 👋
        </h1>
        <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">
          Hi ${name}, just one step left — confirm your email to start finding keyword opportunities on TpT.
        </p>

        <a href="${verifyUrl}"
          style="display: inline-block; background: #7C3AED; color: white; padding: 14px 32px;
                 border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none;">
          Confirm My Email
        </a>

        <p style="color: #94A3B8; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't sign up for TeachersBoost, you can ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #CBD5E1; font-size: 12px;">TeachersBoost — TpT Seller Tools</p>
      </div>
    `,
  })
}
