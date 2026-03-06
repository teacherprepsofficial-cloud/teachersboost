import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: 'TeachersBoost <noreply@teachersboost.com>',
    to: email,
    subject: 'Reset your TeachersBoost password',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">
          Reset your password
        </h1>
        <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">
          Hi ${name}, we received a request to reset your TeachersBoost password. Click the button below to choose a new one.
        </p>

        <a href="${resetUrl}"
          style="display: inline-block; background: #E11D48; color: white; padding: 14px 32px;
                 border-radius: 5px; font-weight: 700; font-size: 16px; text-decoration: none;">
          Reset My Password
        </a>

        <p style="color: #94A3B8; font-size: 13px; margin-top: 32px;">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #CBD5E1; font-size: 12px;">TeachersBoost — TpT Seller Tools</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://teachersboost.vercel.app'

  await resend.emails.send({
    from: 'TeachersBoost <noreply@teachersboost.com>',
    to: email,
    subject: `Welcome to TeachersBoost, ${name}! 🚀`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">

        <!-- Header -->
        <div style="margin-bottom: 32px;">
          <span style="font-size: 22px; font-weight: 900; color: #111827; letter-spacing: -0.5px;">Teachers<span style="color: #E11D48;">Boost</span></span>
        </div>

        <h1 style="font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 12px 0; line-height: 1.2;">
          Welcome aboard, ${name}! 🎉
        </h1>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          You've just joined the smartest TpT sellers who use data — not guesswork — to grow their stores. Here's what you can do right now:
        </p>

        <!-- Feature list -->
        <div style="background: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <span style="font-size: 20px; margin-right: 12px;">🔍</span>
            <div>
              <p style="margin: 0 0 2px 0; font-weight: 700; color: #111827; font-size: 15px;">Keyword Explorer</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">Find low-competition keywords with real TpT competition scores.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <span style="font-size: 20px; margin-right: 12px;">🎯</span>
            <div>
              <p style="margin: 0 0 2px 0; font-weight: 700; color: #111827; font-size: 15px;">Niche Finder</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">Discover untapped product niches before the competition does.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <span style="font-size: 20px; margin-right: 12px;">📈</span>
            <div>
              <p style="margin: 0 0 2px 0; font-weight: 700; color: #111827; font-size: 15px;">TpT Trending Keywords</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">See what buyers are searching for on TpT right now — live.</p>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${siteUrl}/keywords"
            style="display: inline-block; background: #E11D48; color: #ffffff; padding: 16px 40px;
                   border-radius: 5px; font-weight: 800; font-size: 17px; text-decoration: none; letter-spacing: -0.2px;">
            Get Started Now →
          </a>
        </div>

        <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
          You're on the <strong>Free plan</strong> — 3 keyword searches/week &amp; 3 niche searches/month.<br/>
          <a href="${siteUrl}/pricing" style="color: #E11D48; text-decoration: none; font-weight: 600;">Upgrade anytime</a> to unlock unlimited searches.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #CBD5E1; font-size: 12px; text-align: center; margin: 0;">
          TeachersBoost — TpT Seller Tools &nbsp;·&nbsp;
          <a href="${siteUrl}" style="color: #CBD5E1;">teachersboost.vercel.app</a>
        </p>
      </div>
    `,
  })
}

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
          style="display: inline-block; background: #E11D48; color: white; padding: 14px 32px;
                 border-radius: 5px; font-weight: 700; font-size: 16px; text-decoration: none;">
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
