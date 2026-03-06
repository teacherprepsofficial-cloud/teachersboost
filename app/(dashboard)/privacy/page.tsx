export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account (name, email address) and information generated through your use of our tools (keyword searches, saved keywords, generated content).</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">2. How We Use Your Information</h2>
          <p>We use your information to provide and improve TeachersBoost, send transactional emails (account verification, password reset), and respond to your support requests. We do not sell your personal information to third parties.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">3. Data Storage</h2>
          <p>Your data is stored securely using MongoDB Atlas. Passwords are encrypted using industry-standard bcrypt hashing. We do not store payment card details — all payments are processed by Stripe.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">4. Cookies</h2>
          <p>We use session cookies for authentication purposes only. We do not use tracking or advertising cookies.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">5. Third-Party Services</h2>
          <p>We use the following third-party services: Google (OAuth login), Stripe (payment processing), Vercel (hosting), MongoDB Atlas (database), and Google Gemini AI (content generation).</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">6. Your Rights</h2>
          <p>You may request deletion of your account and associated data at any time by emailing <a href="mailto:teachersboost@gmail.com" className="text-gray-800 underline hover:text-rose-600">teachersboost@gmail.com</a>.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">7. Contact</h2>
          <p>For privacy-related questions, contact us at <a href="mailto:teachersboost@gmail.com" className="text-gray-800 underline hover:text-rose-600">teachersboost@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
