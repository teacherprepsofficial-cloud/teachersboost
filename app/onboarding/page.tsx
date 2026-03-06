'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

const GOALS = [
  { value: 'keywords', label: 'Find low-competition keywords', emoji: '🔍' },
  { value: 'traffic', label: 'Grow my store traffic', emoji: '📈' },
  { value: 'research', label: 'Understand what\'s already selling', emoji: '🏆' },
  { value: 'pricing', label: 'Price my products competitively', emoji: '💰' },
  { value: 'new', label: 'I\'m brand new to TpT', emoji: '🌱' },
]

const GRADES = [
  { value: 'early-childhood', label: 'Early Childhood' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle-school', label: 'Middle School' },
  { value: 'high-school', label: 'High School' },
  { value: 'extracurricular', label: 'Extracurricular' },
  { value: 'second-language', label: 'Second Language' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'other', label: 'Other' },
]

const STAGES = [
  { value: 'not-launched', label: "Haven't launched yet" },
  { value: 'new', label: 'New seller (fewer than 25 products)' },
  { value: 'growing', label: 'Growing seller (25–100 products)' },
  { value: 'established', label: 'Established seller (100+ products)' },
  { value: 'fulltime', label: 'Full-time TpT seller' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [grades, setGrades] = useState<string[]>([])
  const [storeStage, setStoreStage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleGrade = (value: string) => {
    if (value === 'all') {
      setGrades(['all'])
      return
    }
    setGrades((prev) => {
      const without = prev.filter((g) => g !== 'all')
      return without.includes(value)
        ? without.filter((g) => g !== value)
        : [...without, value]
    })
  }

  const handleFinish = async () => {
    setIsLoading(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, grades, storeStage }),
    })
    await update({ onboardingCompleted: true })
    router.push('/keywords')
  }

  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%'

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] shadow-lg p-8 max-w-lg w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Goal' : step === 2 ? 'Grade Levels' : 'Store Stage'}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">What's your #1 goal right now?</h1>
            <p className="text-gray-500 text-sm mb-6">We'll personalize TeachersBoost for you.</p>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[5px] border-2 text-left transition ${
                    goal === g.value
                      ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                      : 'border-gray-200 hover:border-rose-300 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!goal}
              className="mt-6 w-full bg-rose-600 text-white py-3 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-40 transition"
            >
              Continue →
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">What grade levels do you sell for?</h1>
            <p className="text-gray-500 text-sm mb-6">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-3">
              {GRADES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => toggleGrade(g.value)}
                  className={`px-4 py-3 rounded-[5px] border-2 text-left text-sm transition ${
                    grades.includes(g.value)
                      ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                      : 'border-gray-200 hover:border-rose-300 text-gray-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-[5px] font-semibold hover:border-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={grades.length === 0}
                className="flex-1 bg-rose-600 text-white py-3 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-40 transition"
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Where is your TpT store right now?</h1>
            <p className="text-gray-500 text-sm mb-6">This helps us show you the most relevant insights.</p>
            <div className="space-y-3">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStoreStage(s.value)}
                  className={`w-full px-4 py-3 rounded-[5px] border-2 text-left transition ${
                    storeStage === s.value
                      ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                      : 'border-gray-200 hover:border-rose-300 text-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-[5px] font-semibold hover:border-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!storeStage || isLoading}
                className="flex-1 bg-rose-600 text-white py-3 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-40 transition"
              >
                {isLoading ? 'Saving...' : "Let's go! 🚀"}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          You can update these preferences anytime in Settings.
        </p>
          </div>
        </div>
      </div>
    </div>
  )
}
