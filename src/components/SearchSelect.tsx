import { useEffect, useId, useMemo, useRef, useState } from 'react'

export interface SearchSelectOption {
  id: string
  primary: string
  secondary?: string
}

interface SearchSelectProps {
  options: SearchSelectOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  emptyMessage?: string
}

function optionLabel(opt: SearchSelectOption): string {
  return opt.secondary ? `${opt.primary} · ${opt.secondary}` : opt.primary
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  emptyMessage = 'No matches',
}: SearchSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.id === value) ?? null

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      const haystack = `${opt.primary} ${opt.secondary ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  function selectOption(opt: SearchSelectOption) {
    onChange(opt.id)
    setOpen(false)
    setQuery('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[activeIndex]
      if (opt) selectOption(opt)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={open ? query : selected ? optionLabel(selected) : ''}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted"
        autoComplete="off"
      />

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-surface-elevated shadow-sm"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-ink-muted">{emptyMessage}</li>
          )}
          {filtered.map((opt, index) => {
            const isActive = index === activeIndex
            const isSelected = opt.id === value
            return (
              <li key={opt.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(opt)}
                  className={[
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                    isActive ? 'bg-surface-warm' : 'bg-surface-elevated',
                    isSelected ? 'font-semibold text-ink' : 'text-ink',
                  ].join(' ')}
                >
                  <span>{opt.primary}</span>
                  {opt.secondary && (
                    <span className="font-utility text-xs text-ink-muted">
                      {opt.secondary}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
