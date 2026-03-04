import Link from 'next/link'
import { ArrowRight, Zap, TrendingUp, Wand2, DollarSign } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">TeachersBoost</h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Log In
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Grow Your TpT Business Faster
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          TeachersBoost gives you the keyword research, pricing insights, and AI tools you need
          to dominate Teachers Pay Teachers
        </p>

        <Link href="/signup" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition text-lg">
          Get Started Free <ArrowRight size={20} />
        </Link>

        <p className="text-gray-600 mt-4">No credit card required • 3 free searches daily</p>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need to Succeed
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                  <Zap className="text-purple-600" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Keyword Research</h4>
                <p className="text-gray-600">
                  Find high-opportunity keywords with low competition using real TpT data
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Shop Analysis</h4>
                <p className="text-gray-600">
                  Get personalized recommendations to optimize your TpT store performance
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                  <Wand2 className="text-green-600" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">AI Generators</h4>
                <p className="text-gray-600">
                  Generate SEO-optimized titles and descriptions that convert
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Pricing Tools</h4>
                <p className="text-gray-600">
                  Find the optimal price for your products based on market data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Simple Pricing
          </h3>
          <p className="text-center text-gray-600 mb-16">
            Start free. Upgrade when you're ready.{' '}
            <Link href="/pricing" className="text-purple-600 font-semibold hover:underline">See full comparison →</Link>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-[5px] shadow p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Free</h4>
              <p className="text-gray-600 mb-6 text-sm">Try it out, no card needed</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$0</div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3"><span className="text-purple-600">✓</span><span className="text-gray-700">3 keyword searches/week</span></li>
                <li className="flex items-center gap-3"><span className="text-purple-600">✓</span><span className="text-gray-700">Keyword Opportunity Grades</span></li>
                <li className="flex items-center gap-3"><span className="text-gray-400">✗</span><span className="text-gray-400">Shop Optimizer</span></li>
                <li className="flex items-center gap-3"><span className="text-gray-400">✗</span><span className="text-gray-400">AI Generators</span></li>
              </ul>
              <Link href="/signup" className="w-full block text-center px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-[5px] hover:bg-gray-50 transition font-semibold">
                Get Started
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-[5px] shadow p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Starter</h4>
              <p className="text-gray-600 mb-6 text-sm">For sellers doing weekly research</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$9.99<span className="text-base font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3"><span className="text-purple-600">✓</span><span className="text-gray-700">30 keyword searches/month</span></li>
                <li className="flex items-center gap-3"><span className="text-purple-600">✓</span><span className="text-gray-700">Keyword Opportunity Grades</span></li>
                <li className="flex items-center gap-3"><span className="text-purple-600">✓</span><span className="text-gray-700">Shop Optimizer</span></li>
                <li className="flex items-center gap-3"><span className="text-gray-400">✗</span><span className="text-gray-400">AI Generators</span></li>
              </ul>
              <Link href="/signup" className="w-full block text-center px-6 py-2 bg-purple-600 text-white rounded-[5px] hover:bg-purple-700 transition font-semibold">
                Get Starter
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-[5px] shadow p-8 text-white relative">
              <div className="absolute -top-4 left-8 bg-orange-400 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <h4 className="text-2xl font-bold mb-2">Pro</h4>
              <p className="text-purple-100 mb-6 text-sm">For sellers who want every edge</p>
              <div className="text-3xl font-bold mb-6">$14.99<span className="text-base font-normal text-purple-200">/mo</span></div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3"><span>✓</span><span>Unlimited keyword searches</span></li>
                <li className="flex items-center gap-3"><span>✓</span><span>Shop Optimizer</span></li>
                <li className="flex items-center gap-3"><span>✓</span><span>AI Title Generator</span></li>
                <li className="flex items-center gap-3"><span>✓</span><span>AI Description Generator</span></li>
                <li className="flex items-center gap-3"><span>✓</span><span>Pricing Calculator</span></li>
              </ul>

              <Link href="/signup" className="w-full block text-center px-6 py-2 bg-orange-400 text-orange-900 rounded-[5px] hover:bg-orange-300 transition font-semibold">
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to grow your TpT business?</h3>
          <p className="text-lg text-purple-100 mb-8">
            Join hundreds of teachers already using TeachersBoost
          </p>
          <Link href="/signup" className="inline-block bg-orange-400 text-orange-900 px-8 py-4 rounded-lg font-semibold hover:bg-orange-300 transition">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 TeachersBoost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
