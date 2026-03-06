'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { FILTER_GROUPS, FilterOption, buildQueryFromFilters, countSelected } from '@/lib/tpt-filters'

interface FilterPanelProps {
  selected: Record<string, string[]>
  onChange: (group: string, value: string, checked: boolean) => void
  onSearch: (query: string) => void
  onClear: () => void
  baseKeyword?: string
}

// Keys shown as dedicated pills
const PILL_KEYS = ['grade', 'subject', 'format', 'resourceType', 'theme']

// Keys excluded entirely
const EXCLUDED_KEYS = ['price', 'standard']

// Flatten options tree into a flat list for rendering in pill dropdowns
function flattenOptions(options: FilterOption[], depth = 0): { option: FilterOption; depth: number }[] {
  const result: { option: FilterOption; depth: number }[] = []
  for (const opt of options) {
    result.push({ option: opt, depth })
    if (opt.children) {
      result.push(...flattenOptions(opt.children, depth + 1))
    }
  }
  return result
}

function PillDropdown({
  label,
  groupKey,
  options,
  selected,
  onChange,
}: {
  label: string
  groupKey: string
  options: FilterOption[]
  selected: string[]
  onChange: (group: string, value: string, checked: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const flat = useMemo(() => flattenOptions(options), [options])

  // Find label of currently selected value (first selected)
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

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = (value: string) => {
    if (selectedValue === value) {
      // deselect
      onChange(groupKey, value, false)
    } else {
      // deselect old, select new
      if (selectedValue) onChange(groupKey, selectedValue, false)
      onChange(groupKey, value, true)
    }
    setOpen(false)
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
        {isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(groupKey, selectedValue!, false) }}
            className="hover:text-rose-200 transition"
          >
            <X size={13} />
          </button>
        )}
        {!isActive && <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 min-w-[200px] max-h-72 overflow-y-auto">
          {flat.map(({ option, depth }) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-sm transition flex items-center justify-between ${
                selected.includes(option.value)
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${16 + depth * 14}px` }}
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

function MoreFiltersDropdown({
  selected,
  onChange,
}: {
  selected: Record<string, string[]>
  onChange: (group: string, value: string, checked: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const moreGroups = FILTER_GROUPS.filter(g => !PILL_KEYS.includes(g.key) && !EXCLUDED_KEYS.includes(g.key))
  const totalSelected = moreGroups.reduce((sum, g) => sum + (selected[g.key]?.length || 0), 0)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition whitespace-nowrap ${
          totalSelected > 0
            ? 'bg-rose-600 border-rose-600 text-white'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        <SlidersHorizontal size={14} />
        <span>More filters</span>
        {totalSelected > 0 && (
          <span className="bg-white/30 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {totalSelected}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 w-72 max-h-96 overflow-y-auto">
          {moreGroups.map(group => (
            <div key={group.key} className="border-b border-gray-100 last:border-0">
              <p className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {group.label}
              </p>
              {flattenOptions(group.options).map(({ option, depth }) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                  style={{ paddingLeft: `${16 + depth * 14}px` }}
                >
                  <input
                    type="checkbox"
                    checked={(selected[group.key] || []).includes(option.value)}
                    onChange={(e) => onChange(group.key, option.value, e.target.checked)}
                    className="w-3.5 h-3.5 accent-rose-600 rounded shrink-0"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterPanel({ selected, onChange, onSearch, onClear, baseKeyword }: FilterPanelProps) {
  const totalSelected = useMemo(() => countSelected(selected), [selected])

  // Chips for all selected filters
  const selectedChips = useMemo(() => {
    const chips: { group: string; value: string; label: string }[] = []
    for (const group of FILTER_GROUPS) {
      const groupSelected = selected[group.key] || []
      if (!groupSelected.length) continue
      function findLabel(opts: FilterOption[], val: string): string | null {
        for (const o of opts) {
          if (o.value === val) return o.label
          if (o.children) { const f = findLabel(o.children, val); if (f) return f }
        }
        return null
      }
      for (const val of groupSelected) {
        chips.push({ group: group.key, value: val, label: findLabel(group.options, val) || val })
      }
    }
    return chips
  }, [selected])

  const handleSearch = () => {
    const query = buildQueryFromFilters(selected, baseKeyword)
    if (!query.trim()) return
    onSearch(query)
  }

  const canSearch = totalSelected > 0 || !!baseKeyword?.trim()

  const pillGroups = FILTER_GROUPS.filter(g => PILL_KEYS.includes(g.key) && !EXCLUDED_KEYS.includes(g.key))

  return (
    <div className="mb-6">
      {/* Pill row */}
      <div className="flex flex-wrap items-center gap-2">
        {pillGroups.map(group => (
          <PillDropdown
            key={group.key}
            label={group.label}
            groupKey={group.key}
            options={group.options}
            selected={selected[group.key] || []}
            onChange={onChange}
          />
        ))}

        <MoreFiltersDropdown selected={selected} onChange={onChange} />

        {totalSelected > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 hover:text-gray-700 transition px-2"
          >
            Clear all
          </button>
        )}

        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className="ml-auto bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition"
        >
          Find Keywords
        </button>
      </div>

      {/* Active chips */}
      {selectedChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedChips.map(chip => (
            <span
              key={`${chip.group}-${chip.value}`}
              className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {chip.label}
              <button
                onClick={() => onChange(chip.group, chip.value, false)}
                className="hover:text-rose-900 transition"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
