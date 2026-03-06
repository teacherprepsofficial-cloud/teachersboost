'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    monthlyPeriod: 'forever',
    yearlyPeriod: 'forever',
    description: 'Try TeachersBoost with no credit card required.',
    cta: 'Get Started Free',
    ctaHref: '/signup',
    highlight: false,
    badge: null as string | null,
    stripePlan: null as string | null,
    features: [
      { label: 'Keyword Research — 3 searches/week', included: true },
      { label: 'Keyword Difficulty Score', included: true },
      { label: 'Top Competing Products', included: true },
      { label: 'Related Keyword Variations', included: true },
      { label: 'Niche Finder — 5 searches/month (top 5 results)', included: true },
      { label: 'Save Keywords', included: false },
      { label: 'Title Generator', included: false },
      { label: 'Description Writer', included: false },
    ],
  },
  {
    name: 'Starter',
    monthlyPrice: '$9.99',
    yearlyPrice: '$7.99',
    monthlyPeriod: '/month',
    yearlyPeriod: '/mo, billed yearly',
    description: 'Unlimited research + AI tools for growing sellers.',
    cta: 'Start Starter Plan',
    ctaHref: '/signup',
    highlight: false,
    badge: null as string | null,
    stripePlan: 'starter',
    features: [
      { label: 'Unlimited Keyword Research', included: true },
      { label: 'Keyword Difficulty Score', included: true },
      { label: 'Top Competing Products', included: true },
      { label: 'Related Keyword Variations', included: true },
      { label: 'Niche Finder — unlimited searches (top 25 results)', included: true },
      { label: 'Save up to 50 Keywords', included: true },
      { label: 'Title Generator — 20/month', included: true },
      { label: 'Description Writer — 20/month', included: true },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: '$14.99',
    yearlyPrice: '$11.99',
    monthlyPeriod: '/month',
    yearlyPeriod: '/mo, billed yearly',
    description: 'Everything in Starter with higher AI limits.',
    cta: 'Go Pro',
    ctaHref: '/signup',
    highlight: true,
    badge: 'BEST VALUE',
    stripePlan: 'pro',
    features: [
      { label: 'Unlimited Keyword Research', included: true },
      { label: 'Keyword Difficulty Score', included: true },
      { label: 'Top Competing Products', included: true },
      { label: 'Related Keyword Variations', included: true },
      { label: 'Niche Finder — unlimited searches (top 25 results)', included: true },
      { label: 'Save up to 100 Keywords', included: true },
      { label: 'Title Generator — 75/month', included: true },
      { label: 'Description Writer — 75/month', included: true },
    ],
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  async function handleUpgrade(planName: string) {
    setLoading(planName)
    setCheckoutError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName, billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(data.error || 'Could not start checkout. Please try again.')
        setLoading(null)
      }
    } catch {
      setCheckoutError('Could not connect. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-10">

        {checkoutError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] text-sm font-semibold">
            {checkoutError}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Simple, transparent pricing.</h2>
          <p className="text-sm text-slate-500">Start free. Upgrade when you're ready to grow your TpT store faster.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${billing === 'annual' ? 'bg-rose-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === 'annual' ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-semibold ${billing === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>Annual</span>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]">SAVE 20%</span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const price = billing === 'annual' ? plan.yearlyPrice : plan.monthlyPrice
            const period = billing === 'annual' ? plan.yearlyPeriod : plan.monthlyPeriod
            const planKey = plan.stripePlan ?? ''
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-[5px] shadow-sm overflow-hidden relative ${
                  plan.highlight ? 'ring-2 ring-rose-500 shadow-md' : ''
                }`}
              >
                {plan.badge && (
                  <div className="bg-rose-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    {plan.badge}
                  </div>
                )}
                {!plan.badge && <div className="h-1 bg-gray-100" />}

                <div className="p-7">
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-5">{plan.description}</p>

                  <div className="mb-1">
                    <span className="text-3xl font-black text-gray-900">{price}</span>
                    <span className="text-gray-400 text-sm ml-1">{period}</span>
                  </div>
                  {billing === 'annual' && plan.stripePlan && (
                    <p className="text-xs text-green-600 font-semibold mb-5">
                      2 months free vs monthly
                    </p>
                  )}
                  {!(billing === 'annual' && plan.stripePlan) && <div className="mb-5" />}

                  {session?.user && plan.stripePlan ? (
                    <button
                      onClick={() => handleUpgrade(planKey)}
                      disabled={loading === planKey}
                      className={`block w-full text-center py-2.5 rounded-[5px] text-sm font-bold transition mb-7 disabled:opacity-60 ${
                        plan.highlight
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {loading === planKey ? 'Redirecting...' : 'Upgrade Now'}
                    </button>
                  ) : (
                    <Link
                      href={plan.name === 'Free' && session?.user ? '/keywords' : plan.ctaHref}
                      className={`block w-full text-center py-2.5 rounded-[5px] text-sm font-bold transition mb-7 ${
                        plan.highlight
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {plan.name === 'Free' && session?.user ? "You're on Free" : plan.cta}
                    </Link>
                  )}

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5">
                        {f.included
                          ? <Check size={15} className="text-rose-500 shrink-0 mt-0.5" />
                          : <X size={15} className="text-gray-300 shrink-0 mt-0.5" />}
                        <span className={`text-xs leading-snug ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ strip */}
        <div className="bg-white rounded-[5px] shadow-sm divide-y divide-gray-100">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no commitments. Cancel from your Settings page at any time. You keep paid access through the end of your billing period, then your account returns to the free plan.' },
            { q: 'Do you offer refunds?', a: 'We do not offer refunds. When you subscribe you get immediate access to all tools, so we cannot refund charges once a billing cycle begins. This is why we offer a free plan first — try everything before paying.' },
            { q: "What's the difference between Starter and Pro?", a: 'Both give unlimited keyword research and niche finding. The difference is AI volume: Starter includes 20 Title Generator and 20 Description Writer uses per month. Pro raises both limits to 75/month.' },
            { q: 'Is my payment secure?', a: 'Yes. Payments are processed by Stripe. We never store your card details.' },
          ].map((item) => (
            <div key={item.q} className="px-6 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{item.q}</p>
              <p className="text-sm text-gray-500">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Questions? Email us at <a href="mailto:teachersboost@gmail.com" className="text-gray-600 hover:text-rose-600 underline">teachersboost@gmail.com</a>
        </p>

      </div>
    </div>
  )
}
