import { Fragment, useEffect, useMemo, useState } from 'react'
import { getReferralRows } from '../services/mockDataService'
import type { ReferralRow, ReferralStatus } from '../types'

type SortKey = 'referredFamilyName' | 'referrerName' | 'status' | 'submissionMethod' | 'createdAt'
type SortDir = 'asc' | 'desc'
type StatusFilter = 'all' | ReferralStatus

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

export function TrackerView() {
  const [rows, setRows] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

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

  const referralsByReferrer = useMemo(() => {
    const map = new Map<string, ReferralRow[]>()
    for (const row of rows) {
      const list = map.get(row.referrerName) ?? []
      list.push(row)
      map.set(row.referrerName, list)
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }
    return map
  }, [rows])

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

  function toggleReferrerPanel(rowId: string) {
    setExpandedRowId((current) => (current === rowId ? null : rowId))
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
          Referral Tracker
        </h1>
        <p className="text-sm text-ink-muted">
          Every referral submission with status, method, and referring family. Click a
          referrer name to see all families they&apos;ve referred.
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
                filtered.map((row) => {
                  const isExpanded = expandedRowId === row.id
                  const referrerReferrals = referralsByReferrer.get(row.referrerName) ?? []

                  return (
                    <Fragment key={row.id}>
                      <tr className="border-b border-line/80 hover:bg-surface-warm/70">
                        <td className="px-4 py-3 font-medium text-ink">
                          {row.referredFamilyName}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleReferrerPanel(row.id)}
                            aria-expanded={isExpanded}
                            className={[
                              'inline-flex items-center gap-1 text-sm font-semibold underline-offset-2 transition-colors',
                              isExpanded
                                ? 'text-navy underline'
                                : 'text-blue hover:text-navy hover:underline',
                            ].join(' ')}
                          >
                            {row.referrerName}
                            <span aria-hidden="true" className="text-xs font-normal text-ink-muted">
                              {isExpanded ? '▴' : '▾'}
                            </span>
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
                      {isExpanded && (
                        <tr className="border-b border-line/80">
                          <td colSpan={5} className="bg-surface-warm px-4 py-3">
                            <div className="rounded-md border border-line bg-surface-elevated p-3">
                              <p className="font-utility mb-2 text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">
                                All referrals by {row.referrerName} (
                                {referrerReferrals.length})
                              </p>
                              <table className="min-w-full text-left text-sm">
                                <thead className="text-ink-muted">
                                  <tr>
                                    <th className="pb-2 pr-4 font-sans text-xs font-semibold uppercase tracking-wide">
                                      Referred family
                                    </th>
                                    <th className="pb-2 pr-4 font-sans text-xs font-semibold uppercase tracking-wide">
                                      Status
                                    </th>
                                    <th className="pb-2 font-sans text-xs font-semibold uppercase tracking-wide">
                                      Date referred
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {referrerReferrals.map((referral) => (
                                    <tr
                                      key={referral.id}
                                      className="border-t border-line/70"
                                    >
                                      <td className="py-2 pr-4 font-medium text-ink">
                                        {referral.referredFamilyName}
                                      </td>
                                      <td className="py-2 pr-4">
                                        <span
                                          className="gt-tag"
                                          data-status={referral.status}
                                        >
                                          {referral.status}
                                        </span>
                                      </td>
                                      <td className="py-2 text-ink-muted">
                                        {formatDate(referral.createdAt)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
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
