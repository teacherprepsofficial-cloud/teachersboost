'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Search, Store, Zap, DollarSign, TrendingUp } from 'lucide-react'

const features = [
  {
    href: '/dashboard/keywords',
    icon: Search,
    title: 'Keyword Research',
    description: 'Find high-opportunity keywords with low competition',
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/dashboard/shop-optimizer',
    icon: Store,
    title: 'Shop Optimizer',
    description: 'Analyze your TpT shop and get personalized recommendations',
    color: 'from-green-500 to-green-600',
  },
  {
    href: '/dashboard/title-generator',
    icon: Zap,
    title: 'Title Generator',
    description: 'AI-powered SEO-optimized product titles for TpT',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    href: '/dashboard/description-generator',
    icon: Zap,
    title: 'Description Generator',
    description: 'Create compelling product descriptions that sell',
    color: 'from-pink-500 to-pink-600',
  },
  {
    href: '/dashboard/pricing-calculator',
    icon: DollarSign,
    title: 'Pricing Calculator',
    description: 'Find the optimal price for your products',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Your one-stop tool for TpT seller success
          </p>
        </div>

        {/* Plan Badge */}
        <div className="mb-12 inline-block">
          <div className={`px-4 py-2 rounded-full font-semibold ${
            session?.user?.plan === 'pro'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {session?.user?.plan === 'pro' ? '⭐ Pro Plan' : '🎯 Free Plan'}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group"
              >
                <div className="bg-white rounded-[15px] overflow-hidden shadow hover:shadow-lg transition h-full">
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                  <div className="p-6">
                    <div className="mb-4">
                      <Icon size={32} className="text-gray-900" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition">
                      Get Started →
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[15px] p-6 shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">Total Searches</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-[15px] p-6 shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">Products Analyzed</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-[15px] p-6 shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">Time Saved</div>
            <div className="text-3xl font-bold text-gray-900">0h</div>
          </div>
        </div>
      </div>
    </div>
  )
}
