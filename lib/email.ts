import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWeeklyOpportunitiesEmail(
  email: string,
  name: string,
  keywords: { keyword: string; competitionScore: number; isRocket: boolean }[]
) {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://teachersboost.vercel.app'

  function getGradeLabel(score: number) {
    if (score <= 1)  return '🚀 Excellent'
    if (score <= 25) return '🟢 Easy'
    if (score <= 50) return '🟠 Medium'
    if (score <= 75) return '🔴 Hard'
    return '⚫ Very Hard'
  }

  function getGradeColor(score: number) {
    if (score <= 1)  return '#15803D'
    if (score <= 25) return '#16A34A'
    if (score <= 50) return '#EA580C'
    if (score <= 75) return '#DC2626'
    return '#475569'
  }

  const rows = keywords.map((kw, i) => `
    <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#F8FAFC'};">
      <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #F1F5F9;">
        <a href="${siteUrl}/keywords/${encodeURIComponent(kw.keyword)}" style="color: #111827; text-decoration: none;">
          ${kw.keyword}
        </a>
      </td>
      <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: ${getGradeColor(kw.competitionScore)}; border-bottom: 1px solid #F1F5F9;">
        ${getGradeLabel(kw.competitionScore)}
      </td>
    </tr>
  `).join('')

  await resend.emails.send({
    from: 'TeachersBoost <noreply@teachersboost.com>',
    to: email,
    subject: `🚀 Your 10 TpT Product Ideas This Week (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">

        <!-- Header -->
        <div style="margin-bottom: 28px;">
          <span style="font-size: 22px; font-weight: 900; color: #111827; letter-spacing: -0.5px;">Teachers<span style="color: #E11D48;">Boost</span></span>
        </div>

        <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px 0; line-height: 1.3;">
          Hi ${name}, here are your 10 TpT product ideas for this week! 🎉
        </h1>

        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
          Every Thursday we hand-pick the best low-competition keyword opportunities on TpT so you can spend less time researching and more time creating. These keywords have been scored using live TpT data. The ones marked 🚀 Excellent are your best bets for getting found fast.
        </p>

        <!-- Keyword Table -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
          <thead>
            <tr style="background: #111827;">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">
                Product Idea / Keyword
              </th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">
                Keyword Difficulty
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
          Pick one keyword that excites you and create a product around it this week. Consistency is what separates the top TpT sellers from everyone else, and you've got the data to back you up. Good luck! 💪
        </p>

        <!-- CTA -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${siteUrl}/keywords"
            style="display: inline-block; background: #E11D48; color: #ffffff; padding: 14px 36px;
                   border-radius: 5px; font-weight: 800; font-size: 16px; text-decoration: none;">
            Explore More Keywords →
          </a>
        </div>

        <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
          The TeachersBoost Team
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #CBD5E1; font-size: 12px; text-align: center; margin: 0;">
          TeachersBoost TpT Seller Tools &nbsp;·&nbsp;
          <a href="${siteUrl}" style="color: #CBD5E1; text-decoration: none;">teachersboost.vercel.app</a>
          &nbsp;·&nbsp;
          You're receiving this because you opted in at signup.
        </p>
      </div>
    `,
  })
}

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
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password won't change.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #CBD5E1; font-size: 12px;">TeachersBoost TpT Seller Tools</p>
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
          You've just joined the smartest TpT sellers who use data (not guesswork) to grow their stores. Here's what you can do right now:
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
              <p style="margin: 0; color: #64748B; font-size: 14px;">See what buyers are searching for on TpT right now, live.</p>
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
          TeachersBoost TpT Seller Tools &nbsp;·&nbsp;
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
          Hi ${name}, just one step left. Confirm your email to start finding keyword opportunities on TpT.
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
        <p style="color: #CBD5E1; font-size: 12px;">TeachersBoost TpT Seller Tools</p>
      </div>
    `,
  })
}
