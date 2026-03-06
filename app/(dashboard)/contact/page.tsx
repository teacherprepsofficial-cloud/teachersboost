export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6 text-sm text-gray-700 leading-relaxed">
        <p className="text-lg font-bold text-gray-900">We'd love to hear from you.</p>
        <p>Have a question, a suggestion, or just want to say hello? Reach out to us directly:</p>
        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
            <a href="mailto:teachersboost@gmail.com" className="text-gray-900 font-semibold hover:text-rose-600 hover:underline text-base">
              teachersboost@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Response Time</p>
            <p className="text-gray-700">We typically respond within 1–2 business days.</p>
          </div>
        </div>
        <p className="text-slate-400">You can also use the feedback button in the bottom-right corner of any page to send us a quick message.</p>
      </div>
    </div>
  )
}
