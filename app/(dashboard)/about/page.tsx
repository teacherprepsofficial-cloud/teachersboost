export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6 text-sm text-gray-700 leading-relaxed">
        <p className="text-lg font-bold text-gray-900">Built for TpT sellers, by someone who gets it.</p>
        <p>TeachersBoost is a suite of research and creation tools designed specifically for Teachers Pay Teachers sellers. Whether you're just starting out or have hundreds of products in your store, we help you find what to make, how to describe it, and how to get it seen.</p>
        <p>We built TeachersBoost because TpT sellers spend too much time guessing — guessing what keywords to target, guessing what to price their products, guessing why some listings perform and others don't. TeachersBoost replaces that guesswork with real data and AI-powered tools.</p>
        <h2 className="text-base font-black text-gray-900 mt-8">What we offer</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li><strong>Keyword Research</strong> — Find low-competition keywords with real TpT data</li>
          <li><strong>Niche Finder</strong> — Discover the most profitable niches for your teaching role</li>
          <li><strong>Title Generator</strong> — AI-generated SEO-optimized product titles</li>
          <li><strong>Description Writer</strong> — Full product descriptions + education standards in one click</li>
        </ul>
        <h2 className="text-base font-black text-gray-900 mt-8">Contact us</h2>
        <p>Questions, feedback, or partnership inquiries: <a href="mailto:teachersboost@gmail.com" className="text-gray-800 underline hover:text-rose-600 font-medium">teachersboost@gmail.com</a></p>
      </div>
    </div>
  )
}
