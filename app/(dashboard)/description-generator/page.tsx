'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Wand2, Copy, Check } from 'lucide-react'
import { SignupPromptModal } from '@/components/SignupPromptModal'

const GRADE_LEVELS = ['PreK','Kindergarten','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','Higher Education','Adult Education','Homeschool','Staff','Not Grade Specific']

const SUBJECT_AREAS = ['Arts','Art History','Cooking','Dance','Drama','Graphic Arts','Instrumental Music','Music','Music Composition','Visual Arts','Vocal Music','Other (Arts)','Other (Music)','English Language Arts','Balanced Literacy','EFL - ESL - ELD','ELA Test Prep','Creative Writing','Grammar','Close Reading','Other (ELA)','Writing Expository','Writing-Essays','Spelling','Informational Text','Literature','Phonics','Poetry','Reading','Reading Strategies','Short Stories','Vocabulary','Writing','Holidays/Seasonal','Autumn','Back to School','Black History Month','Christmas/ Chanukah/ Kwanzaa','Earth Day','Easter','End of Year','Halloween','Hispanic Heritage Month','Martin Luther King Day',"President's Day",'Spring',"St. Patrick's Day",'Summer','Thanksgiving','The New Year',"Valentine's Day",'Winter',"Women's History Month",'Math','Algebra','Algebra 2','Applied Math','Arithmetic','Basic Operations','Calculus','Decimals','Fractions','Geometry','Graphing','Math Test Prep','Measurement','Mental Math','Numbers','Order of Operations','Place Value','PreCalculus','Statistics','Trigonometry','Word Problems','Other (Math)','Science','Anatomy','Archaeology','Astronomy','Basic Principles','Biology','Chemistry','Earth Sciences','Engineering','Environment','Forensics','General Science','Physical Science','Physics','Other (Science)','Social Studies - History','African History','Ancient History','Asian Studies','Australian History','British History','Canadian History','Civics','Criminal Justice - Law','Economics','Elections - Voting','European History','Geography','Government','Latinx Studies','Middle Ages','Native Americans','Psychology','U.S. History','World History','Other (Social Studies - History)','Specialty','Business','Career and Technical Education','Character Education','Child Care','Classroom Community','Classroom Management','Coaching','Computer Science - Technology','Critical Thinking','Early Intervention','Family Consumer Sciences','For Administrators','For All Subjects','Gifted and Talented','Handwriting','Health','Instructional Technology','International Baccalaureate','Library Skills','Life Skills','Occupational Therapy','Oral Communication','Physical Education','Physical Therapy','Problem Solving','Products for TpT Sellers','Professional Development','Religion','Robotics','School Counseling','School Psychology','Social Emotional Learning','Special Education','Speech Therapy','Student Council','Study Skills','Test Preparation','Tools for Common Core','Vocational Education','Other (Specialty)','World Language','American Sign Language','Arabic','Chinese','en Français','French','Gaeilge','German','Hebrew','Italian','Japanese','Latin','Portuguese','Russian','Spanish','Other (World Language)','For All Subject Areas']

const RESOURCE_TYPES = ['Activboard Activities','Activities','Assessments','Bibliographies','Bulletin Board Ideas','By TpT Sellers For TpT Sellers','Centers','Classroom Forms','Clip Art','Cultural Activities','DBQs','Elective Course Proposals','English (UK)','Excel Spreadsheets','Flash Cards','Fonts','For Parents','For Principals & Administrators','Games','GATE','Google Apps','Grant Proposals','Graphic Organizers','Guided Reading Books','Handouts','Homeschool Curricula','Homework','Independent Work Packet','Interactive Notebooks','Interactive Whiteboard','Internet Activities','Laboratory','Lectures','Lesson','Literatures Circles','Microsoft OneDrive','Montessori','Movie Guides','Outlines','Posters','Powerpoint Presentations','Prezis','Printables','Professional Development','Professional Documents','Projects','Reflective Journals for Teachers','Research','Rubrics','Scaffolded Notes','School Nurse Documents','Scripts','Service Learning','Simulations','Songs','Study Guides','Syllabi','Task Cards','Teacher Manuals','Thematic Unit Plans','Unit Plans','Video Files','Webquests','Word Walls','Workbooks','Worksheets']

const SET_COLORS: Record<string, string> = {
  CCSS: 'bg-blue-100 text-blue-800 border-blue-200',
  TEKS: 'bg-orange-100 text-orange-800 border-orange-200',
  NGSS: 'bg-green-100 text-green-800 border-green-200',
}

const RELEVANCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function DescriptionGeneratorPage() {
  const { data: session } = useSession()
  const [gradeLevel, setGradeLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [skill, setSkill] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [extraNotes, setExtraNotes] = useState('')
  const [description, setDescription] = useState('')
  const [standards, setStandards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedStd, setCopiedStd] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)

  const [showSignupModal, setShowSignupModal] = useState(false)
  const plan = session?.user?.plan || 'free'
  const isPaid = plan === 'starter' || plan === 'pro' || plan === 'admin'

  const generate = async () => {
    if (!topic.trim()) return
    if (!session) { setShowSignupModal(true); return }
    setLoading(true)
    setError('')
    setDescription('')
    setStandards([])

    const res = await fetch('/api/tools/description-writer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradeLevel, subject, topic, skill, resourceType, extraNotes }),
    })
    const d = await res.json()

    if (!res.ok) {
      setError(d.error || 'Something went wrong')
    } else {
      setDescription(d.description)
      setStandards(d.standards || [])
      setUsage({ used: d.used, limit: d.limit })
    }
    setLoading(false)
  }

  const copyDesc = () => {
    navigator.clipboard.writeText(description)
    setCopiedDesc(true)
    setTimeout(() => setCopiedDesc(false), 2000)
  }

  const copyStd = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopiedStd(idx)
    setTimeout(() => setCopiedStd(null), 2000)
  }

  const copyAllStandards = () => {
    const text = standards.map(s => s.code).join(', ')
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <>
    <div className="min-h-screen bg-[#F1F5F9]">

      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">

        {!isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-[5px] px-5 py-4 text-sm text-amber-800 font-medium">
            Description Writer is available on Starter and Pro plans. <a href="/pricing" className="underline font-bold">Upgrade your plan →</a>
          </div>
        )}

        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <p className="text-sm text-slate-500">Fill in the details below — the more you provide, the better the description and standards will be.</p>

          {/* Row 1: Grade + Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Grade Level</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} disabled={!isPaid}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Select grade...</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject Area</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} disabled={!isPaid}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Select subject...</option>
                {SUBJECT_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Topic (required) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Topic <span className="text-red-500">*</span></label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. double-digit multiplication, plant life cycle, writing topic sentences"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled={!isPaid}
            />
          </div>

          {/* Row 3: Skill */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Skill <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              value={skill}
              onChange={e => setSkill(e.target.value)}
              placeholder="e.g. learning to multiply numbers up to 100 using arrays"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled={!isPaid}
            />
          </div>

          {/* Row 4: Resource Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Resource Type</label>
            <select value={resourceType} onChange={e => setResourceType(e.target.value)} disabled={!isPaid}
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">Select type...</option>
              {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Row 5: Extra notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Anything else? <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={extraNotes}
              onChange={e => setExtraNotes(e.target.value)}
              placeholder="e.g. includes answer key, 30 task cards, digital and print versions, aligned to TEKS..."
              rows={2}
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              disabled={!isPaid}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading || !topic.trim() || !isPaid}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Wand2 size={16} />
            {loading ? 'Writing description + finding standards...' : 'Generate Description & Standards'}
          </button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {usage && (
            <p className="text-xs text-slate-400 text-right">
              {usage.used} / {usage.limit === Infinity ? '∞' : usage.limit} descriptions used this month
            </p>
          )}
        </div>

        {/* Description output */}
        {description && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Generated Description</h2>
              <button onClick={copyDesc} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                {copiedDesc ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copiedDesc ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-5">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{description}</pre>
            </div>
          </div>
        )}

        {/* Standards output */}
        {standards.length > 0 && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">🤖 Education Standards</h2>
              <button onClick={copyAllStandards} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                {copiedAll ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copiedAll ? 'Copied!' : 'Copy all codes'}
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {standards.map((s, idx) => (
                <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-rose-50 transition">
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-[5px] border mt-0.5 ${SET_COLORS[s.set] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {s.set}
                  </span>
                  <button
                    onClick={() => copyStd(s.code, idx)}
                    className="shrink-0 mt-0.5 font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-[5px] hover:bg-rose-100 transition flex items-center gap-1"
                    title="Copy code"
                  >
                    {s.code}
                    {copiedStd === idx ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
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
            <div className="px-5 py-3 bg-[#F1F5F9] border-t border-gray-100">
              <p className="text-xs text-slate-400">Standards are AI-generated. Always verify codes against official documentation before publishing to TpT.</p>
            </div>
          </div>
        )}
      </div>
    </div>
    <SignupPromptModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  )
}
