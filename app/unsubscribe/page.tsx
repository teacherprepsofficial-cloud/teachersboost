import Link from 'next/link'

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="bg-white rounded-[5px] border border-gray-200 shadow-sm max-w-md w-full p-10 text-center">
        <p className="text-4xl mb-4">👋</p>
        <h1 className="text-2xl font-black text-gray-900 mb-3">You've been unsubscribed</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          You won't receive our weekly TpT product idea emails anymore. You can re-enable them anytime from your account settings.
        </p>
        <Link
          href="/keywords"
          className="inline-block bg-rose-600 text-white px-6 py-3 rounded-[5px] font-bold text-sm hover:bg-rose-700 transition"
        >
          Back to TeachersBoost
        </Link>
      </div>
    </div>
  )
}
