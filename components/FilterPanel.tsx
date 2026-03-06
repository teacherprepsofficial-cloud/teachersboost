'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { FILTER_GROUPS, FilterOption, buildQueryFromFilters, countSelected } from '@/lib/tpt-filters'

interface FilterPanelProps {
  selected: Record<string, string[]>
  onChange: (group: string, value: string, checked: boolean) => void
  onAutoSearch: (query: string) => void
  onClear: () => void
  baseKeyword?: string
}

const EXCLUDED_KEYS = ['price', 'standard']

function flattenOptions(options: FilterOption[], depth = 0): { option: FilterOption; depth: number }[] {
  const result: { option: FilterOption; depth: number }[] = []
  for (const opt of options) {
    result.push({ option: opt, depth })
    if (opt.children) result.push(...flattenOptions(opt.children, depth + 1))
  }
  return result
}

function PillDropdown({
  label,
  groupKey,
  options,
  selected,
  onChange,
  onAutoSearch,
  allSelected,
  baseKeyword,
}: {
  label: string
  groupKey: string
  options: FilterOption[]
  selected: string[]
  onChange: (group: string, value: string, checked: boolean) => void
  onAutoSearch: (query: string) => void
  allSelected: Record<string, string[]>
  baseKeyword?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const flat = useMemo(() => flattenOptions(options), [options])

  const selectedValue = selected[0]
  const selectedLabel = useMemo(() => {
    if (!selectedValue) return null
    function find(opts: FilterOption[]): string | null {
      for (const o of opts) {
        if (o.value === selectedValue) return o.label
        if (o.children) { const f = find(o.children); if (f) return f }
      }
      return null
    }
    return find(options)
  }, [selectedValue, options])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = (value: string) => {
    let newSelected: Record<string, string[]>
    if (selectedValue === value) {
      onChange(groupKey, value, false)
      newSelected = { ...allSelected, [groupKey]: [] }
    } else {
      if (selectedValue) onChange(groupKey, selectedValue, false)
      onChange(groupKey, value, true)
      newSelected = { ...allSelected, [groupKey]: [value] }
    }
    setOpen(false)
    const query = buildQueryFromFilters(newSelected, baseKeyword)
    if (query.trim()) onAutoSearch(query)
  }

  const isActive = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition whitespace-nowrap ${
          isActive
            ? 'bg-rose-600 border-rose-600 text-white'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        <span>{selectedLabel || label}</span>
        {isActive ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onChange(groupKey, selectedValue!, false)
              const newSelected = { ...allSelected, [groupKey]: [] }
              const query = buildQueryFromFilters(newSelected, baseKeyword)
              if (query.trim()) onAutoSearch(query)
            }}
            className="hover:text-rose-200 transition"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 min-w-[200px] max-h-72 overflow-y-auto">
          {flat.map(({ option, depth }) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left py-2 text-sm transition flex items-center justify-between ${
                selected.includes(option.value)
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${16 + depth * 14}px`, paddingRight: '16px' }}
            >
              <span>{option.label}</span>
              {selected.includes(option.value) && <span className="text-rose-500 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterPanel({ selected, onChange, onAutoSearch, onClear, baseKeyword }: FilterPanelProps) {
  const totalSelected = useMemo(() => countSelected(selected), [selected])
  const activeGroups = FILTER_GROUPS.filter(g => !EXCLUDED_KEYS.includes(g.key))

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {activeGroups.map(group => (
          <PillDropdown
            key={group.key}
            label={group.label}
            groupKey={group.key}
            options={group.options}
            selected={selected[group.key] || []}
            onChange={onChange}
            onAutoSearch={onAutoSearch}
            allSelected={selected}
            baseKeyword={baseKeyword}
          />
        ))}

        {totalSelected > 0 && (
          <button
            onClick={() => {
              onClear()
              if (baseKeyword?.trim()) onAutoSearch(baseKeyword.trim())
            }}
            className="text-sm text-gray-400 hover:text-gray-700 transition px-2"
          >
            Clear all
          </button>
        )}
      </div>

    </div>
  )
}
