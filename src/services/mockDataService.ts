import { families, referrers, referrals, TIER_REWARD_COST } from '../data/mockData'
import type {
  DashboardMetrics,
  Family,
  Referral,
  ReferralRow,
  Referrer,
} from '../types'

const AS_OF = new Date('2026-07-23T12:00:00.000Z')

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
  const familyById = new Map(families.map((f) => [f.id, f]))
  const referrerById = new Map(referrers.map((r) => [r.id, r]))

  const rows: ReferralRow[] = referrals.map((referral) => {
    const referrer = referrerById.get(referral.referrer_id)
    const referrerFamily = referrer ? familyById.get(referrer.family_id) : undefined

    return {
      id: referral.id,
      referredFamilyName: referral.referred_family_name,
      referrerName: referrerFamily?.name ?? 'Unknown',
      status: referral.status,
      submissionMethod: referral.submission_method,
      createdAt: referral.created_at,
      enrolledAt: referral.enrolled_at,
    }
  })

  return delay(rows)
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

  // Cost: sum of tier rewards for referrers who earned them, / successful enrollments
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
