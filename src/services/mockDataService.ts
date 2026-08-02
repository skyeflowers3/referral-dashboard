import { families, referrers, referrals, TIER_REWARD_COST } from '../data/mockData'
import { syncRewardFulfillments } from '../data/rewardMilestones'
import type {
  DashboardMetrics,
  Family,
  Referral,
  ReferralRow,
  ReferralStatus,
  Referrer,
  RewardFulfillments,
  RewardMilestoneAt,
  RewardStatus,
} from '../types'

const AS_OF = new Date('2026-07-23T12:00:00.000Z')
const STORAGE_KEY = 'gt-referral-mock-v3'

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

function monthsBetween(fromIso: string, to: Date): number {
  const from = new Date(fromIso)
  const ms = to.getTime() - from.getTime()
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30.44))
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ families, referrers, referrals }),
    )
  } catch {
    // ignore quota / private mode
  }
}

function hydrateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as {
      families: Family[]
      referrers: Referrer[]
      referrals: Referral[]
    }
    if (!data.families?.length || !data.referrers?.length || !data.referrals?.length) {
      return
    }
    if (
      data.referrers.some(
        (r) =>
          typeof r.successful_referral_count !== 'number' ||
          !r.reward_fulfillments?.[1],
      )
    ) {
      return
    }
    families.splice(0, families.length, ...data.families)
    referrers.splice(0, referrers.length, ...data.referrers)
    referrals.splice(0, referrals.length, ...data.referrals)
  } catch {
    // ignore bad cache
  }
}

hydrateFromStorage()

function recomputeReferrerSuccess(referrerId: string) {
  const referrer = referrers.find((r) => r.id === referrerId)
  if (!referrer) return

  const successful = referrals.filter(
    (r) => r.referrer_id === referrerId && r.status === 'enrolled',
  ).length
  referrer.successful_referral_count = successful
  referrer.reward_fulfillments = syncRewardFulfillments(
    referrer.reward_fulfillments,
    successful,
  )
}

function buildReferralRows(): ReferralRow[] {
  const familyById = new Map(families.map((f) => [f.id, f]))
  const referrerById = new Map(referrers.map((r) => [r.id, r]))

  return referrals.map((referral) => {
    const referrer = referrerById.get(referral.referrer_id)
    const referrerFamily = referrer ? familyById.get(referrer.family_id) : undefined

    return {
      id: referral.id,
      referredFamilyName: referral.referred_family_name,
      referrerName: referrerFamily?.name ?? 'Unknown',
      referrerId: referral.referrer_id,
      status: referral.status,
      submissionMethod: referral.submission_method,
      createdAt: referral.created_at,
      enrolledAt: referral.enrolled_at,
      successfulReferralCount: referrer?.successful_referral_count ?? 0,
      tier: referrer?.tier ?? 1,
    }
  })
}

export interface ReferrerDetail {
  referrerId: string
  referrerName: string
  email: string
  tier: number
  referralCount: number
  successfulReferralCount: number
  rewardFulfillments: RewardFulfillments
  referrals: ReferralRow[]
}

/** All enrolled GT families (mirrors `families` table). */
export async function getFamilies(): Promise<Family[]> {
  return delay([...families])
}

/** Families who made ≥1 referral (mirrors `referrers` table). */
export async function getReferrers(): Promise<Referrer[]> {
  return delay([...referrers])
}

/** Individual referral records (mirrors `referrals` table). */
export async function getReferrals(): Promise<Referral[]> {
  return delay([...referrals])
}

/** Joined rows for the Tracker table view. */
export async function getReferralRows(): Promise<ReferralRow[]> {
  return delay(buildReferralRows())
}

export async function getReferrerDetail(
  referrerId: string,
  options?: { immediate?: boolean },
): Promise<ReferrerDetail | null> {
  const referrer = referrers.find((r) => r.id === referrerId)
  if (!referrer) {
    return options?.immediate ? null : delay(null)
  }

  const family = families.find((f) => f.id === referrer.family_id)
  const rows = buildReferralRows()
    .filter((r) => r.referrerId === referrerId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const detail: ReferrerDetail = {
    referrerId: referrer.id,
    referrerName: family?.name ?? 'Unknown',
    email: family?.email ?? '',
    tier: referrer.tier,
    referralCount: referrer.referral_count,
    successfulReferralCount: referrer.successful_referral_count,
    rewardFulfillments: referrer.reward_fulfillments,
    referrals: rows,
  }

  return options?.immediate ? detail : delay(detail)
}

/** Staff override: update a referral's admissions status. */
export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus,
): Promise<ReferralRow[]> {
  const referral = referrals.find((r) => r.id === referralId)
  if (!referral) return delay(buildReferralRows())

  referral.status = status
  referral.enrolled_at =
    status === 'enrolled'
      ? referral.enrolled_at ?? new Date().toISOString()
      : null

  recomputeReferrerSuccess(referral.referrer_id)
  persist()
  return delay(buildReferralRows())
}

/** Staff override: update one milestone's gift fulfillment. */
export async function updateReferrerReward(
  referrerId: string,
  atSuccessful: RewardMilestoneAt,
  rewardStatus: RewardStatus,
  rewardNotes: string,
): Promise<ReferrerDetail | null> {
  const referrer = referrers.find((r) => r.id === referrerId)
  if (!referrer) return null

  referrer.reward_fulfillments = {
    ...referrer.reward_fulfillments,
    [atSuccessful]: { status: rewardStatus, notes: rewardNotes },
  }
  persist()
  return getReferrerDetail(referrerId, { immediate: true })
}

/**
 * Aggregated analytics for the Dashboard view.
 * Swap the body of these functions for Supabase queries later.
 */
export async function getMetrics(): Promise<DashboardMetrics> {
  const totalFamilies = families.length
  const familiesWhoReferred = referrers.length
  const participationRate = (familiesWhoReferred / totalFamilies) * 100

  const totalReferrals = referrals.length
  const enrolledReferrals = referrals.filter((r) => r.status === 'enrolled').length
  const conversionRate = totalReferrals === 0 ? 0 : (enrolledReferrals / totalReferrals) * 100

  const totalRewardCost = referrers.reduce(
    (sum, r) => sum + TIER_REWARD_COST[r.tier],
    0,
  )
  const costPerEnrolledReferral =
    enrolledReferrals === 0 ? 0 : totalRewardCost / enrolledReferrals

  const referredMonths = families
    .filter((f) => f.is_referred)
    .map((f) => monthsBetween(f.enrolled_at, AS_OF))
  const nonReferredMonths = families
    .filter((f) => !f.is_referred)
    .map((f) => monthsBetween(f.enrolled_at, AS_OF))

  const countBuckets = { '1': 0, '2': 0, '3': 0, '4+': 0 }
  for (const r of referrers) {
    if (r.referral_count >= 4) countBuckets['4+'] += 1
    else if (r.referral_count === 3) countBuckets['3'] += 1
    else if (r.referral_count === 2) countBuckets['2'] += 1
    else countBuckets['1'] += 1
  }

  const metrics: DashboardMetrics = {
    participationRate,
    totalFamilies,
    familiesWhoReferred,
    conversionRate,
    enrolledReferrals,
    totalReferrals,
    industryBenchmarkLow: 20,
    industryBenchmarkHigh: 40,
    generalBenchmark: 3.2,
    costPerEnrolledReferral,
    totalRewardCost,
    avgRetentionMonthsReferred: average(referredMonths),
    avgRetentionMonthsNonReferred: average(nonReferredMonths),
    referralCountDistribution: [
      { label: '1', count: countBuckets['1'] },
      { label: '2', count: countBuckets['2'] },
      { label: '3', count: countBuckets['3'] },
      { label: '4+', count: countBuckets['4+'] },
    ],
  }

  return delay(metrics)
}
