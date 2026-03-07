'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Wand2, Copy, Check } from 'lucide-react'
import { containsProfanity, PROFANITY_ERROR } from '@/lib/profanity'
import { SignupPromptModal } from '@/components/SignupPromptModal'

const GRADE_LEVELS = ['PreK','Kindergarten','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','Higher Education','Adult Education','Homeschool','Staff','Not Grade Specific']

const SUBJECT_AREAS = ['Arts','Art History','Cooking','Dance','Drama','Graphic Arts','Instrumental Music','Music','Music Composition','Visual Arts','Vocal Music','Other (Arts)','Other (Music)','English Language Arts','Balanced Literacy','EFL - ESL - ELD','ELA Test Prep','Creative Writing','Grammar','Close Reading','Other (ELA)','Writing Expository','Writing-Essays','Spelling','Informational Text','Literature','Phonics','Poetry','Reading','Reading Strategies','Short Stories','Vocabulary','Writing','Holidays/Seasonal','Autumn','Back to School','Black History Month','Christmas/ Chanukah/ Kwanzaa','Earth Day','Easter','End of Year','Halloween','Hispanic Heritage Month','Martin Luther King Day',"President's Day",'Spring',"St. Patrick's Day",'Summer','Thanksgiving','The New Year',"Valentine's Day",'Winter',"Women's History Month",'Math','Algebra','Algebra 2','Applied Math','Arithmetic','Basic Operations','Calculus','Decimals','Fractions','Geometry','Graphing','Math Test Prep','Measurement','Mental Math','Numbers','Order of Operations','Place Value','PreCalculus','Statistics','Trigonometry','Word Problems','Other (Math)','Science','Anatomy','Archaeology','Astronomy','Basic Principles','Biology','Chemistry','Earth Sciences','Engineering','Environment','Forensics','General Science','Physical Science','Physics','Other (Science)','Social Studies - History','African History','Ancient History','Asian Studies','Australian History','British History','Canadian History','Civics','Criminal Justice - Law','Economics','Elections - Voting','European History','Geography','Government','Latinx Studies','Middle Ages','Native Americans','Psychology','U.S. History','World History','Other (Social Studies - History)','Specialty','Business','Career and Technical Education','Character Education','Child Care','Classroom Community','Classroom Management','Coaching','Computer Science - Technology','Critical Thinking','Early Intervention','Family Consumer Sciences','For Administrators','For All Subjects','Gifted and Talented','Handwriting','Health','Instructional Technology','International Baccalaureate','Library Skills','Life Skills','Occupational Therapy','Oral Communication','Physical Education','Physical Therapy','Problem Solving','Products for TpT Sellers','Professional Development','Religion','Robotics','School Counseling','School Psychology','Social Emotional Learning','Special Education','Speech Therapy','Student Council','Study Skills','Test Preparation','Tools for Common Core','Vocational Education','Other (Specialty)','World Language','American Sign Language','Arabic','Chinese','en Français','French','Gaeilge','German','Hebrew','Italian','Japanese','Latin','Portuguese','Russian','Spanish','Other (World Language)','For All Subject Areas']

const BENEFITS = ['Interactive','Editable','Comprehensive','Differentiated','Multicultural','Easy-to-use','Printable','Standards-aligned','Low-prep','No-prep','Collaborative','Gamified','Technology-enhanced','Personalized','Differentiated assessments','Common Core-aligned','Cross-curricular','Scaffolded','Project-based','Flexible grouping','Student-centered','Formative assessment','Independent learning','Inquiry-based','Differentiated homework','Parent resources','Engaging visuals and graphics']

const RESOURCE_TYPES = ['Activboard Activities','Activities','Assessments','Bibliographies','Bulletin Board Ideas','By TpT Sellers For TpT Sellers','Centers','Classroom Forms','Clip Art','Cultural Activities','DBQs','Elective Course Proposals','English (UK)','Excel Spreadsheets','Flash Cards','Fonts','For Parents','For Principals & Administrators','Games','GATE','Google Apps','Grant Proposals','Graphic Organizers','Guided Reading Books','Handouts','Homeschool Curricula','Homework','Independent Work Packet','Interactive Notebooks','Interactive Whiteboard','Internet Activities','Laboratory','Lectures','Lesson','Literatures Circles','Microsoft OneDrive','Montessori','Movie Guides','Outlines','Posters','Powerpoint Presentations','Prezis','Printables','Professional Development','Professional Documents','Projects','Reflective Journals for Teachers','Research','Rubrics','Scaffolded Notes','School Nurse Documents','Scripts','Service Learning','Simulations','Songs','Study Guides','Syllabi','Task Cards','Teacher Manuals','Thematic Unit Plans','Unit Plans','Video Files','Webquests','Word Walls','Workbooks','Worksheets']

export default function TitleGeneratorPage() {
  const { data: session } = useSession()
  const [keyword, setKeyword] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [subjectArea, setSubjectArea] = useState('')
  const [benefit, setBenefit] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)

  const [showSignupModal, setShowSignupModal] = useState(false)
  const plan = session?.user?.plan || 'free'
  const isPaid = plan === 'starter' || plan === 'pro' || plan === 'admin'

  const generate = async () => {
    if (!keyword.trim()) return
    if (containsProfanity(keyword)) { setError(PROFANITY_ERROR); return }
    if (!session) { setShowSignupModal(true); return }
    setLoading(true)
    setError('')
    setTitles([])

    const res = await fetch('/api/tools/title-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, gradeLevel, subjectArea, benefit, resourceType }),
    })
    const d = await res.json()

    if (!res.ok) {
      setError(d.error || 'Something went wrong')
    } else {
      setTitles(d.titles)
      setUsage({ used: d.used, limit: d.limit })
    }
    setLoading(false)
  }

  const copyTitle = (title: string, idx: number) => {
    navigator.clipboard.writeText(title)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
    <div className="min-h-screen bg-[#F1F5F9]">

      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">

        {!isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-[5px] px-5 py-4 text-sm text-amber-800 font-medium">
            Title Generator is available on Boost and Pro plans. <a href="/pricing" className="underline font-bold">Upgrade your plan →</a>
          </div>
        )}

        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Keyword / Topic <span className="text-red-500">*</span></label>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isPaid && generate()}
              placeholder="e.g. fractions, reading comprehension, American Revolution"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled={!isPaid}
            />
          </div>

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
              <select value={subjectArea} onChange={e => setSubjectArea(e.target.value)} disabled={!isPaid}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Select subject...</option>
                {SUBJECT_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Benefit</label>
              <select value={benefit} onChange={e => setBenefit(e.target.value)} disabled={!isPaid}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Select benefit...</option>
                {BENEFITS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Resource Type</label>
              <select value={resourceType} onChange={e => setResourceType(e.target.value)} disabled={!isPaid}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Select type...</option>
                {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !keyword.trim() || !isPaid}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Wand2 size={16} />
            {loading ? 'Generating...' : 'Generate Titles'}
          </button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {usage && (
            <p className="text-xs text-slate-400 text-right">
              {usage.used} / {usage.limit === Infinity ? '∞' : usage.limit} titles used this month
            </p>
          )}
        </div>

        {titles.length > 0 && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3">
              <h2 className="text-white font-bold text-sm">Generated Titles — click to copy</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {titles.map((title, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-4 hover:bg-rose-50 transition group">
                  <p className="text-sm font-medium text-gray-800 flex-1 pr-4">{title}</p>
                  <button onClick={() => copyTitle(title, idx)} className="shrink-0 text-slate-300 group-hover:text-rose-500 transition" title="Copy title">
                    {copied === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    <SignupPromptModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  )
}
