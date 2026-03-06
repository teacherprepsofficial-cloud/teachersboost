'use client'

import { useState } from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'

const GRADE_LEVELS = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']
const STANDARDS_SETS = [
  { value: 'CCSS', label: 'Common Core (CCSS)', description: 'ELA & Math — used in 40+ states' },
  { value: 'TEKS', label: 'TEKS (Texas)', description: 'Texas Essential Knowledge & Skills' },
  { value: 'NGSS', label: 'NGSS (Science)', description: 'Next Generation Science Standards' },
]

const RELEVANCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function StandardsTaggerPage() {
  const [topic, setTopic] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [standardsSet, setStandardsSet] = useState('CCSS')
  const [standards, setStandards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<number | null>(null)

  const find = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setStandards([])

    const res = await fetch('/api/tools/standards-tagger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, gradeLevel, standardsSet }),
    })
    const d = await res.json()
    if (!res.ok) setError(d.error || 'Something went wrong')
    else setStandards(d.standards)
    setLoading(false)
  }

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    const text = standards.map(s => `${s.code} — ${s.description}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(-1)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="bg-[#0f172a] px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-3xl font-black tracking-tight">Standards Tagger</h1>
          <p className="text-slate-400 text-sm mt-1">Find the right CCSS, TEKS, or NGSS standards to tag your TpT product</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">

        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Topic / Skill <span className="text-red-500">*</span></label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && find()}
              placeholder="e.g. adding fractions with unlike denominators"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Grade Level</label>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Any grade</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Standards Set</label>
              <select
                value={standardsSet}
                onChange={e => setStandardsSet(e.target.value)}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {STANDARDS_SETS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={find}
            disabled={loading || !topic.trim()}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <BookOpen size={16} />
            {loading ? 'Finding standards...' : 'Find Standards'}
          </button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>

        {standards.length > 0 && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Matching Standards — click code to copy</h2>
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                {copied === -1 ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied === -1 ? 'Copied!' : 'Copy all'}
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {standards.map((s, idx) => (
                <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-rose-50 transition group">
                  <button
                    onClick={() => copyCode(s.code, idx)}
                    className="shrink-0 mt-0.5 font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-[5px] hover:bg-rose-100 transition flex items-center gap-1"
                    title="Copy code"
                  >
                    {s.code}
                    {copied === idx ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{s.description}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-[5px] border capitalize ${RELEVANCE_COLORS[s.relevance] || RELEVANCE_COLORS.low}`}>
                    {s.relevance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
