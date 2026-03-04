import Link from 'next/link'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try TeachersBoost and see what keywords you\'ve been missing.',
    cta: 'Get Started Free',
    ctaHref: '/signup',
    ctaStyle: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
    highlight: false,
    features: [
      { label: '3 keyword searches per week', included: true },
      { label: 'Keyword Opportunity Grades', included: true },
      { label: 'Keyword Breakdown (top products)', included: true },
      { label: 'Competition Score', included: true },
      { label: 'Shop Optimizer', included: false },
      { label: 'AI Title Generator', included: false },
      { label: 'AI Description Generator', included: false },
      { label: 'Pricing Calculator', included: false },
    ],
  },
  {
    name: 'Starter',
    price: '$9.99',
    period: 'per month',
    description: 'For TpT sellers ready to do serious keyword research every week.',
    cta: 'Start Starter Plan',
    ctaHref: '/signup',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
    highlight: false,
    badge: null,
    features: [
      { label: '30 keyword searches per month', included: true },
      { label: 'Keyword Opportunity Grades', included: true },
      { label: 'Keyword Breakdown (top products)', included: true },
      { label: 'Competition Score', included: true },
      { label: 'Shop Optimizer', included: true },
      { label: 'AI Title Generator', included: false },
      { label: 'AI Description Generator', included: false },
      { label: 'Pricing Calculator', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$14.99',
    period: 'per month',
    description: 'Unlimited research + AI tools. For sellers who want every edge.',
    cta: 'Go Pro',
    ctaHref: '/signup',
    ctaStyle: 'bg-orange-400 text-orange-900 hover:bg-orange-300',
    highlight: true,
    badge: 'BEST VALUE',
    features: [
      { label: 'Unlimited keyword searches', included: true },
      { label: 'Keyword Opportunity Grades', included: true },
      { label: 'Keyword Breakdown (top products)', included: true },
      { label: 'Competition Score', included: true },
      { label: 'Shop Optimizer', included: true },
      { label: 'AI Title Generator', included: true },
      { label: 'AI Description Generator', included: true },
      { label: 'Pricing Calculator', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">

      {/* Nav */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-gray-900">TeachersBoost</Link>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">Log In</Link>
          <Link href="/signup" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Sign Up</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center px-6 pt-12 pb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-xl mx-auto">
          Start free. Upgrade when you're ready to grow your TpT business faster.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-[15px] shadow overflow-hidden relative ${
                plan.highlight ? 'ring-2 ring-purple-500 shadow-xl scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">
                  {plan.badge}
                </div>
              )}

              <div className={`h-2 ${plan.highlight ? 'bg-gradient-to-r from-purple-500 to-orange-400' : 'bg-gray-200'}`} />

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2 text-sm">{plan.period}</span>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full text-center py-3 rounded-[15px] font-semibold transition mb-8 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-3">
                      {f.included
                        ? <Check size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                        : <X size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                      <span className={f.included ? 'text-gray-700 text-sm' : 'text-gray-400 text-sm'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel anytime with one click. No contracts, no hidden fees.',
              },
              {
                q: 'What counts as a keyword search?',
                a: 'Each time you search a keyword in the Keyword Research tool, that counts as one search. Viewing a saved keyword breakdown does not count.',
              },
              {
                q: 'What\'s the difference between Starter and Pro?',
                a: 'Starter gives you 30 searches/month — plenty for most sellers. Pro is for power users who want unlimited searches and AI-powered title and description generators.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'If you\'re not happy in your first 7 days, reach out and we\'ll make it right.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-[15px] p-6 shadow-sm">
                <p className="font-bold text-gray-900 mb-2">{item.q}</p>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 text-center">
        <p>&copy; TeachersBoost. All rights reserved.</p>
      </footer>
    </div>
  )
}
