'use client'

import { useState } from 'react'

export function InfoTooltip({ text, dark, align = 'left' }: { text: string; dark?: boolean; align?: 'left' | 'right' | 'center' }) {
  const [show, setShow] = useState(false)

  const posClass =
    align === 'right' ? 'right-0' :
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    'left-0'

  const arrowClass =
    align === 'right' ? 'right-3' :
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    'left-3'

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow(s => !s)}
        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold leading-none transition cursor-default select-none ${
          dark
            ? 'border-slate-400 text-slate-400 hover:text-slate-200 hover:border-slate-200'
            : 'border-teal-500 text-teal-600 hover:text-teal-700 hover:border-teal-700'
        }`}
        aria-label="More info"
        type="button"
      >
        i
      </button>
      {show && (
        <div className={`absolute z-[9999] top-full mt-2 w-64 bg-teal-800 text-teal-50 text-xs rounded-[5px] px-3 py-2.5 shadow-xl pointer-events-none leading-relaxed ${posClass}`}>
          <div className={`absolute bottom-full border-4 border-transparent border-b-teal-800 ${arrowClass}`} />
          {text}
        </div>
      )}
    </span>
  )
}
