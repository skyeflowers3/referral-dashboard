import { useEffect, useState } from 'react'
import { getEligibleGifts } from '../data/rewardMilestones'
import {
  getReferrerDetail,
  updateReferralStatus,
  updateReferrerReward,
  type ReferrerDetail,
} from '../services/mockDataService'
import type {
  MilestoneFulfillment,
  ReferralStatus,
  RewardMilestoneAt,
  RewardStatus,
} from '../types'

interface ReferrerDetailViewProps {
  referrerId: string
  onBack: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMethod(method: 'link' | 'direct_submit'): string {
  return method === 'link' ? 'Link' : 'Direct submit'
}

function formatRewardStatus(status: RewardStatus): string {
  switch (status) {
    case 'not_eligible':
      return 'Not eligible'
    case 'eligible':
      return 'Eligible'
    case 'claimed':
      return 'Claimed'
    case 'fulfilled':
      return 'Fulfilled'
  }
}

type MilestoneDrafts = Record<RewardMilestoneAt, MilestoneFulfillment>

/** Status mirrors saved data; notes start empty so the text box is compose-only. */
function draftsFromDetail(detail: ReferrerDetail): MilestoneDrafts {
  return {
    1: { status: detail.rewardFulfillments[1].status, notes: '' },
    2: { status: detail.rewardFulfillments[2].status, notes: '' },
    3: { status: detail.rewardFulfillments[3].status, notes: '' },
    4: { status: detail.rewardFulfillments[4].status, notes: '' },
  }
}

export function ReferrerDetailView({ referrerId, onBack }: ReferrerDetailViewProps) {
  const [detail, setDetail] = useState<ReferrerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingMilestone, setSavingMilestone] = useState<RewardMilestoneAt | null>(null)
  const [milestoneDrafts, setMilestoneDrafts] = useState<MilestoneDrafts | null>(null)
  const [editingMilestones, setEditingMilestones] = useState<
    Partial<Record<RewardMilestoneAt, boolean>>
  >({})
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ReferralStatus>>({})
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  async function load(options?: { quiet?: boolean }) {
    if (!options?.quiet) setLoading(true)
    try {
      const data = await getReferrerDetail(referrerId)
      setDetail(data)
      if (data) {
        setMilestoneDrafts(draftsFromDetail(data))
        const drafts: Record<string, ReferralStatus> = {}
        for (const row of data.referrals) {
          drafts[row.id] = row.status
        }
        setStatusDrafts(drafts)
      }
    } finally {
      if (!options?.quiet) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [referrerId])

  function startEditing(atSuccessful: RewardMilestoneAt) {
    if (!detail) return
    const saved = detail.rewardFulfillments[atSuccessful]
    setMilestoneDrafts((prev) =>
      prev
        ? {
            ...prev,
            [atSuccessful]: { status: saved.status, notes: saved.notes },
          }
        : prev,
    )
    setEditingMilestones((prev) => ({ ...prev, [atSuccessful]: true }))
    setSaveMessage(null)
  }

  function cancelEditing(atSuccessful: RewardMilestoneAt) {
    if (!detail) return
    const saved = detail.rewardFulfillments[atSuccessful]
    setMilestoneDrafts((prev) =>
      prev
        ? {
            ...prev,
            [atSuccessful]: { status: saved.status, notes: '' },
          }
        : prev,
    )
    setEditingMilestones((prev) => ({ ...prev, [atSuccessful]: false }))
    setSaveMessage(null)
  }

  async function saveMilestone(atSuccessful: RewardMilestoneAt) {
    if (!detail || !milestoneDrafts) return
    const draft = milestoneDrafts[atSuccessful]
    const saved = detail.rewardFulfillments[atSuccessful]
    // In edit mode the box is the source of truth (can clear). Otherwise empty keeps existing.
    const noteToSave = editingMilestones[atSuccessful]
      ? draft.notes.trim()
      : draft.notes.trim() || saved.notes
    setSavingMilestone(atSuccessful)
    setSaveMessage(null)
    try {
      const next = await updateReferrerReward(
        detail.referrerId,
        atSuccessful,
        draft.status,
        noteToSave,
      )
      if (next) {
        setDetail(next)
        setMilestoneDrafts(draftsFromDetail(next))
        setEditingMilestones((prev) => ({ ...prev, [atSuccessful]: false }))
        setSaveMessage(`Saved fulfillment for ${atSuccessful} successful.`)
      } else {
        setSaveMessage('Could not save fulfillment.')
      }
    } catch {
      setSaveMessage('Could not save fulfillment.')
    } finally {
      setSavingMilestone(null)
    }
  }

  async function deleteNote(atSuccessful: RewardMilestoneAt) {
    if (!detail) return
    const saved = detail.rewardFulfillments[atSuccessful]
    setSavingMilestone(atSuccessful)
    setSaveMessage(null)
    try {
      const next = await updateReferrerReward(
        detail.referrerId,
        atSuccessful,
        saved.status,
        '',
      )
      if (next) {
        setDetail(next)
        setMilestoneDrafts(draftsFromDetail(next))
        setSaveMessage('Note deleted.')
      } else {
        setSaveMessage('Could not delete note.')
      }
    } catch {
      setSaveMessage('Could not delete note.')
    } finally {
      setSavingMilestone(null)
    }
  }

  async function saveReferralStatus(referralId: string) {
    const status = statusDrafts[referralId]
    if (!status) return
    setSavingMilestone(null)
    setSaveMessage(null)
    try {
      await updateReferralStatus(referralId, status)
      await load({ quiet: true })
      setSaveMessage('Status saved.')
    } catch {
      setSaveMessage('Could not save status.')
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm text-ink-muted">Loading referrer…</p>
      </section>
    )
  }

  if (!detail || !milestoneDrafts) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-semibold text-blue hover:text-navy"
        >
          ← Back to Tracker
        </button>
        <p className="text-sm text-ink-muted">Referrer not found.</p>
      </section>
    )
  }

  const eligibleMilestones = getEligibleGifts(detail.successfulReferralCount).toReversed()

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-semibold text-blue hover:text-navy"
      >
        ← Back to Tracker
      </button>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
          {detail.referrerName}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{detail.email}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface-elevated p-4">
          <p className="font-utility text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">
            Referrals made
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">{detail.referrals.length}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface-elevated p-4">
          <p className="font-utility text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">
            Successful (enrolled)
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {detail.successfulReferralCount}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-surface-elevated p-4">
        <h2 className="mb-3 font-sans text-sm font-semibold text-ink">
          Gifts eligible for
        </h2>

        {eligibleMilestones.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No gifts yet. Gifts unlock when a referred family enrolls.
          </p>
        ) : (
          <div className="space-y-4">
            {eligibleMilestones.map((milestone) => {
              const at = milestone.atSuccessful
              const saved = detail.rewardFulfillments[at]
              const draft = milestoneDrafts[at]
              const isFulfilled = saved.status === 'fulfilled'
              const showEditor = !isFulfilled || Boolean(editingMilestones[at])
              const dirty = showEditor
                ? editingMilestones[at]
                  ? draft.status !== saved.status ||
                    draft.notes.trim() !== saved.notes.trim()
                  : draft.status !== saved.status || draft.notes.trim().length > 0
                : false
              const saving = savingMilestone === at

              return (
                <div
                  key={at}
                  className="rounded-md border border-line bg-surface-warm/60 p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-utility text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">
                      At {at} successful{at === 4 ? '+' : ''}
                    </p>
                    <span className="gt-tag" data-reward={saved.status}>
                      {formatRewardStatus(saved.status)}
                    </span>
                  </div>
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-ink">
                    {milestone.gifts.map((gift) => (
                      <li key={gift}>{gift}</li>
                    ))}
                  </ul>

                  {saved.notes.trim() && !editingMilestones[at] && (
                    <div className="mb-3 rounded-md border border-line bg-surface-elevated px-3 py-2">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-utility text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">
                          Note
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(at)}
                            className="text-xs font-semibold text-blue hover:text-navy"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void deleteNote(at)}
                            className="text-xs font-semibold text-ink-muted hover:text-ink"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-ink">{saved.notes}</p>
                    </div>
                  )}

                  {isFulfilled && !showEditor && (
                    <button
                      type="button"
                      onClick={() => startEditing(at)}
                      className="rounded-md border border-line-strong bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-navy"
                    >
                      Edit fulfillment
                    </button>
                  )}

                  {showEditor && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="mb-1 block font-semibold text-ink">
                            Fulfillment status
                          </span>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              setMilestoneDrafts((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      [at]: {
                                        ...prev[at],
                                        status: e.target.value as RewardStatus,
                                      },
                                    }
                                  : prev,
                              )
                            }
                            className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none"
                          >
                            <option value="eligible">Eligible</option>
                            <option value="claimed">Claimed</option>
                            <option value="fulfilled">Fulfilled</option>
                          </select>
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1 block font-semibold text-ink">
                            {editingMilestones[at] || saved.notes.trim()
                              ? 'Note'
                              : 'Add note'}
                          </span>
                          <input
                            type="text"
                            value={draft.notes}
                            onChange={(e) =>
                              setMilestoneDrafts((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      [at]: {
                                        ...prev[at],
                                        notes: e.target.value,
                                      },
                                    }
                                  : prev,
                              )
                            }
                            placeholder="Write a note, then save"
                            className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={saving || !dirty}
                          onClick={() => void saveMilestone(at)}
                          className="rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        {isFulfilled && editingMilestones[at] && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => cancelEditing(at)}
                            className="rounded-md border border-line-strong bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink-muted"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {saveMessage && (
          <p className="mt-3 text-xs font-medium text-ink-muted">{saveMessage}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface-elevated">
        <div className="border-b border-line bg-surface-warm px-4 py-3">
          <h2 className="font-sans text-sm font-semibold text-ink">Past referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide">
                  Referred family
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide">
                  Method
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide">
                  Update
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.referrals.map((row) => (
                <tr key={row.id} className="border-b border-line/80">
                  <td className="px-4 py-3 font-medium text-ink">
                    {row.referredFamilyName}
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
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={statusDrafts[row.id] ?? row.status}
                        onChange={(e) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [row.id]: e.target.value as ReferralStatus,
                          }))
                        }
                        className="rounded-md border border-line-strong bg-surface px-2 py-1.5 text-xs text-ink outline-none"
                      >
                        <option value="invited">Invited</option>
                        <option value="applied">Applied</option>
                        <option value="enrolled">Enrolled</option>
                      </select>
                      <button
                        type="button"
                        disabled={
                          savingMilestone !== null ||
                          (statusDrafts[row.id] ?? row.status) === row.status
                        }
                        onClick={() => void saveReferralStatus(row.id)}
                        className="rounded-md bg-navy px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
