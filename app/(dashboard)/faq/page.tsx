'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ_SECTIONS = [
  {
    section: '🧭 About TeachersBoost',
    items: [
      {
        q: 'What is TeachersBoost?',
        a: 'TeachersBoost is your all-in-one SEO tool for sellers on Teachers Pay Teachers to discover profitable keywords, optimize your product listings, and find smart products to make and sell.',
      },
      {
        q: 'Who is TeachersBoost for?',
        a: 'TeachersBoost is made for educators who want to earn more on TpT.',
      },
      {
        q: 'Do I need to be tech-savvy to use it?',
        a: 'Not at all. TeachersBoost is easy to use right from the start!',
      },
      {
        q: 'Is TeachersBoost affiliated with Teachers Pay Teachers?',
        a: 'No. TeachersBoost is an independent product with no affiliation to Teachers Pay Teachers.',
      },
    ],
  },
  {
    section: '🛍️ Why Sell on TpT?',
    items: [
      {
        q: 'Why do teachers sell on Teachers Pay Teachers?',
        a: 'Most teachers are already creating worksheets, lesson plans, and activities for their own classrooms. TpT lets you upload those same resources and earn money every time another teacher downloads them. It\'s passive income built on work you\'ve already done.',
      },
      {
        q: 'How much money can you actually make selling on TpT?',
        a: 'Earnings vary widely. Some sellers earn a little extra each month; others have built it into a full-time income. TeachersBoost doesn\'t guarantee sales, but we know this: the more quality products you list in the right niches, the more opportunity you create for yourself.',
      },
      {
        q: 'What kinds of products sell best on TpT?',
        a: 'Specific, ready-to-use resources perform best. Targeted worksheets, task cards, standards-aligned activities, and seasonal materials all do well. Products that solve a clear classroom problem for a specific grade level and subject tend to get found and purchased. Our Keyword Research and Niche Finder tools help you identify those opportunities.',
      },
      {
        q: 'How hard is it to get started selling on TpT?',
        a: 'Starting is straightforward: create a free TpT seller account, upload a product, write a title and description, set a price, and you\'re live. The harder part is knowing what to create, how to write listings that get found, and how to stand out. That\'s what TeachersBoost is for.',
      },
    ],
  },
  {
    section: '🔑 How TeachersBoost Helps',
    items: [
      {
        q: 'What does the Keyword Research tool do?',
        a: 'Type in any topic and instantly see how competitive it is on TpT. You\'ll get a Keyword Difficulty score (0-100), the number of products already competing for that term, and a list of related keyword variations with their own scores.',
      },
      {
        q: 'What is Keyword Difficulty and why does it matter?',
        a: 'Keyword Difficulty is a 0-100 score showing how hard it would be to rank for a keyword on TpT. Low score means few products exist for that search, which is a real opportunity. We grade it as: Excellent (0-1), Easy (2-25), Medium (26-50), Hard (51-75), and Very Hard (76-100).',
      },
      {
        q: 'What is the Niche Finder and how does it work?',
        a: 'Tell it what you teach ("3rd grade math teacher," "high school special education") and it returns a ranked list of low-competition keyword opportunities tailored to your role. Free users see the top 5 results; Boost plan users see the full 25.',
      },
      {
        q: 'What does the Title Generator do?',
        a: 'It generates five SEO-optimized TpT product titles based on your keyword, grade level, subject, resource type, and benefit. You pick the one you like best, or use them as a starting point.',
      },
      {
        q: 'What is the Description Writer?',
        a: 'Fill in your grade level, subject, topic, skill, and resource type and it writes a full TpT product description for you, including all the standard sections buyers expect. It also automatically identifies relevant education standards (CCSS, TEKS, NGSS) so you don\'t have to look them up.',
      },
      {
        q: 'How will TeachersBoost help me grow my TpT store?',
        a: 'It removes the guesswork. You\'ll know which keywords to target before you create a product, how to write listings that get found, and where the underserved niches are in your subject area. Smarter decisions at every step add up over time.',
      },
      {
        q: 'How is TeachersBoost different from just searching TpT myself?',
        a: 'Searching TpT manually only shows you what exists. It doesn\'t tell you how competitive a keyword is, which variations have less competition, or what niches fit your specific teaching background. TeachersBoost analyzes that data for you and surfaces opportunities you\'d never find on your own.',
      },
    ],
  },
  {
    section: '💳 Pricing & Plans',
    items: [
      {
        q: 'Is TeachersBoost free?',
        a: 'Yes. The free plan includes access to Keyword Research (3 searches per week) and Niche Finder (5 searches per month). No credit card required.',
      },
      {
        q: "What's the difference between the Free, Starter, and Pro plans?",
        a: 'Free gives you limited keyword and niche research. Starter ($9.99/month) unlocks unlimited keyword searches, unlimited niche finding, and access to the Title Generator and Description Writer (20 generations each per month). Pro ($14.99/month) includes everything in Starter with higher AI limits: 75 title and 75 description generations per month.',
      },
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Settings in the left sidebar. Your current plan is shown there along with upgrade options. Changes take effect immediately.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. No contracts, no commitments. Cancel from your Settings page at any time. You keep your paid access through the end of your current billing period, then your account reverts to the free plan.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We do not offer refunds. When you subscribe, you get immediate access to all tools, so we cannot refund charges once a billing cycle begins. This is exactly why we offer a free tier first, so you can try everything before paying. Questions about billing? Email us at teachersboost@gmail.com.',
      },
    ],
  },
  {
    section: '🔐 Account & Privacy',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Visit teachersboost.com and click Sign Up. Register with your email or Google account. No credit card needed for the free plan.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes! Data is stored securely in our database. Passwords are safely secured. We do not sell your data or use tracking cookies. See our Privacy Policy for full details.',
      },
      {
        q: 'How do I delete my account?',
        a: null, // handled with custom component below
      },
      {
        q: 'How do I contact support?',
        a: 'Email us at teachersboost@gmail.com. We typically respond within 1-2 business days. You can also use the feedback button in the bottom-right corner of any page.',
      },
    ],
  },
]

function DeleteAccountButton() {
  const { data: session } = useSession()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!session?.user) {
    return <p className="text-sm text-gray-600">You must be signed in to delete your account.</p>
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    const res = await fetch('/api/user/delete-account', { method: 'DELETE' })
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      const d = await res.json()
      setError(d.error || 'Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        You can permanently delete your account and all associated data directly from here. This action cannot be undone.
      </p>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="text-sm font-bold text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-[5px] hover:bg-red-100 transition"
        >
          Delete My Account
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700">Are you sure? This will permanently delete your account, saved keywords, and all data. There is no undo.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-bold bg-red-600 text-white px-4 py-2 rounded-[5px] hover:bg-red-700 disabled:opacity-50 transition"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-sm font-bold text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-[5px] hover:bg-[#F1F5F9] transition"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (key: string) => setOpen(prev => prev === key ? null : key)

  return (
    <div className="min-h-screen bg-[#F1F5F9]">

      <div className="max-w-2xl mx-auto px-8 py-6 space-y-8">
        {FAQ_SECTIONS.map(section => (
          <div key={section.section}>
            <h2 className="text-base font-black text-gray-900 mb-3">{section.section}</h2>
            <div className="bg-white rounded-[5px] shadow-sm overflow-hidden divide-y divide-gray-100">
              {section.items.map((item, idx) => {
                const key = `${section.section}-${idx}`
                const isOpen = open === key
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-rose-50 transition group"
                    >
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-rose-700 pr-4">
                        {item.q}
                      </span>
                      {isOpen
                        ? <ChevronUp size={16} className="shrink-0 text-rose-500" />
                        : <ChevronDown size={16} className="shrink-0 text-slate-400 group-hover:text-rose-500" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        {item.a === null
                          ? <DeleteAccountButton />
                          : <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="bg-[#0f172a] rounded-[5px] px-6 py-5 text-center">
          <p className="text-white font-bold text-sm mb-1">Still have questions?</p>
          <p className="text-slate-400 text-xs mb-2">We're happy to help — reach out anytime.</p>
          <p className="text-rose-400 text-sm font-semibold">teachersboost@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
