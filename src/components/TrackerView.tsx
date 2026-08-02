import { useEffect, useMemo, useState } from 'react'
import { getReferralRows } from '../services/mockDataService'
import type { ReferralRow, ReferralStatus } from '../types'

type SortKey =
  | 'referredFamilyName'
  | 'referrerName'
  | 'status'
  | 'submissionMethod'
  | 'createdAt'
type SortDir = 'asc' | 'desc'
type StatusFilter = 'all' | ReferralStatus

interface TrackerViewProps {
  onOpenReferrer: (referrerId: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMethod(method: ReferralRow['submissionMethod']): string {
  return method === 'link' ? 'Link' : 'Direct submit'
}

export function TrackerView({ onOpenReferrer }: TrackerViewProps) {
  const [rows, setRows] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getReferralRows().then((data) => {
      if (!cancelled) {
        setRows(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const next = rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      return (
        row.referredFamilyName.toLowerCase().includes(q) ||
        row.referrerName.toLowerCase().includes(q) ||
        row.status.includes(q) ||
        formatMethod(row.submissionMethod).toLowerCase().includes(q)
      )
    })

    next.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })

    return next
  }, [rows, search, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'createdAt' ? 'desc' : 'asc')
    }
  }

  function sortIndicator(key: SortKey): string {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
          Referral Tracker
        </h1>
        <p className="text-sm text-ink-muted">
          Click a referrer to open their page with past referrals and gift status.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search referrals</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search family or referrer…"
            className="w-full rounded-md border border-line-strong bg-surface-elevated px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="font-sans text-sm font-semibold text-ink whitespace-nowrap">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border border-line-strong bg-surface-elevated px-3 py-2.5 text-sm font-medium text-ink outline-none"
          >
            <option value="all">All statuses</option>
            <option value="invited">Invited</option>
            <option value="applied">Applied</option>
            <option value="enrolled">Enrolled</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-warm text-ink-muted">
              <tr>
                {(
                  [
                    ['referredFamilyName', 'Referred family'],
                    ['referrerName', 'Referrer'],
                    ['status', 'Status'],
                    ['submissionMethod', 'Method'],
                    ['createdAt', 'Date'],
                  ] as const
                ).map(([key, label]) => (
                  <th key={key} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="font-sans inline-flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wide hover:text-ink"
                    >
                      {label}
                      <span aria-hidden="true">{sortIndicator(key)}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    Loading referrals…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No referrals match your filters.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line/80 hover:bg-surface-warm/70"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {row.referredFamilyName}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onOpenReferrer(row.referrerId)}
                        className="text-sm font-semibold text-blue underline-offset-2 hover:text-navy hover:underline"
                      >
                        {row.referrerName}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="gt-tag" data-status={row.status}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatMethod(row.submissionMethod)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="border-t border-line bg-surface-warm px-4 py-3 text-xs text-ink-muted">
            Showing {filtered.length} of {rows.length} referrals
          </div>
        )}
      </div>
    </section>
  )
}
