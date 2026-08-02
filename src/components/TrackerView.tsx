import { useEffect, useMemo, useState } from 'react'
import {
  createReferral,
  getAttributionOptions,
  getReferralRows,
  getUnattributedApplicantOptions,
  resetMockData,
  type ApplicantOption,
  type AttributionOption,
} from '../services/mockDataService'
import type { ReferralRow, ReferralStatus } from '../types'
import { useConfirm } from './ConfirmDialog'
import { SearchSelect } from './SearchSelect'

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
  if (method === 'link') return 'Link'
  if (method === 'staff_attributed') return 'Staff created'
  return 'Direct submit'
}

function formatStatus(status: ReferralStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function TrackerView({ onOpenReferrer }: TrackerViewProps) {
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [rows, setRows] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [showAdd, setShowAdd] = useState(false)
  const [attributionOptions, setAttributionOptions] = useState<AttributionOption[]>(
    [],
  )
  const [applicantOptions, setApplicantOptions] = useState<ApplicantOption[]>([])
  const [familyId, setFamilyId] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [newStatus, setNewStatus] = useState<ReferralStatus>('applied')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [formError, setFormError] = useState('')

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

  useEffect(() => {
    if (!showAdd) return
    let cancelled = false
    Promise.all([getAttributionOptions(), getUnattributedApplicantOptions()]).then(
      ([families, applicants]) => {
        if (cancelled) return
        setAttributionOptions(families)
        setApplicantOptions(applicants)
      },
    )
    return () => {
      cancelled = true
    }
  }, [showAdd])

  const referrerSelectOptions = useMemo(
    () =>
      attributionOptions.map((opt) => ({
        id: opt.familyId,
        primary: opt.name,
        secondary: opt.referralCode,
      })),
    [attributionOptions],
  )

  const applicantSelectOptions = useMemo(
    () =>
      applicantOptions.map((opt) => ({
        id: opt.id,
        primary: opt.lastName,
        secondary: opt.email,
      })),
    [applicantOptions],
  )

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

  function resetForm() {
    setApplicationId('')
    setNewStatus('applied')
    setFormError('')
    setFamilyId('')
  }

  async function submitAddReferral(e: React.FormEvent) {
    e.preventDefault()
    if (!familyId || !applicationId) {
      setFormError('Referrer and applicant are required.')
      return
    }
    const referrer = attributionOptions.find((o) => o.familyId === familyId)
    const applicant = applicantOptions.find((a) => a.id === applicationId)
    const ok = await confirm({
      title: 'Create this referral?',
      description: `Credit ${referrer?.name ?? 'this family'} for ${
        applicant ? `the ${applicant.lastName} application` : 'this application'
      }. This creates a referral in the program records.`,
      confirmLabel: 'Create referral',
    })
    if (!ok) return

    setSaving(true)
    setFormError('')
    try {
      const next = await createReferral({
        familyId,
        applicationId,
        status: newStatus,
      })
      setRows(next)
      setShowAdd(false)
      resetForm()
    } catch {
      setFormError('Could not add referral.')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetDemo() {
    const ok = await confirm({
      title: 'Reset demo data?',
      description:
        'This clears local edits and restores the original mock dataset used for demos.',
      confirmLabel: 'Reset demo data',
    })
    if (!ok) return
    setResetting(true)
    try {
      await resetMockData()
      window.location.reload()
    } catch {
      setResetting(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {confirmDialog}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
            Referral Tracker
          </h1>
          <p className="text-sm text-ink-muted">
            Click a referrer to open their page with past referrals and gift status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowAdd(true)
          }}
          className="shrink-0 self-start rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white sm:self-auto"
        >
          Add referral
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={(e) => void submitAddReferral(e)}
          className="mb-6 rounded-lg border border-line bg-surface-elevated p-4"
        >
          <h2 className="mb-1 font-sans text-sm font-semibold text-ink">
            Add referral
          </h2>
          <p className="mb-4 text-sm text-ink-muted">
            Create a referral from an in-progress application (applied without a
            referral code) and credit an enrolled family.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-ink">
                Credit referrer (enrolled family)
              </span>
              <SearchSelect
                options={referrerSelectOptions}
                value={familyId}
                onChange={setFamilyId}
                placeholder="Search family or code…"
                emptyMessage="No families match"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-ink">
                Applicant (in progress)
              </span>
              <SearchSelect
                options={applicantSelectOptions}
                value={applicationId}
                onChange={setApplicationId}
                placeholder="Search last name or email…"
                emptyMessage="No open applications match"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-ink">Status</span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReferralStatus)}
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none"
              >
                <option value="applied">Applied</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="enrolled">Enrolled</option>
              </select>
            </label>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-warn" role="alert">
              {formError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save referral'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowAdd(false)
                resetForm()
              }}
              className="rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
            <option value="applied">Applied</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
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
                        {formatStatus(row.status)}
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-warm px-4 py-3 text-xs text-ink-muted">
            <span>
              Showing {filtered.length} of {rows.length} referrals
            </span>
            <button
              type="button"
              disabled={resetting}
              onClick={() => void handleResetDemo()}
              className="font-semibold text-blue underline-offset-2 hover:text-navy hover:underline disabled:opacity-40"
            >
              {resetting ? 'Resetting…' : 'Reset demo data'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
