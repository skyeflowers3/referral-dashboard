export type ReferralStatus = 'applied' | 'accepted' | 'declined' | 'enrolled'
export type SubmissionMethod = 'link' | 'direct_submit' | 'staff_attributed'
export type ReferrerTier = 1 | 2 | 3
export type RewardStatus = 'not_eligible' | 'eligible' | 'claimed' | 'fulfilled'
export type RewardMilestoneAt = 1 | 2 | 3 | 4

export interface MilestoneFulfillment {
  status: RewardStatus
  notes: string
}

export type RewardFulfillments = Record<RewardMilestoneAt, MilestoneFulfillment>

export interface Family {
  id: string
  name: string
  email: string
  /** Every enrolled family gets a code, even before their first referral */
  referral_code: string
  enrolled_at: string
  is_referred: boolean
  referred_by_id: string | null
}

export interface Referrer {
  id: string
  family_id: string
  referral_code: string
  tier: ReferrerTier
  referral_count: number
  /** Successful enrollments credited to this referrer */
  successful_referral_count: number
  /** Per-milestone gift fulfillment (1 / 2 / 3 / 4+) */
  reward_fulfillments: RewardFulfillments
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_family_name: string
  referred_email: string
  status: ReferralStatus
  submission_method: SubmissionMethod
  created_at: string
  enrolled_at: string | null
  /** HubSpot/SIS application this referral was attributed from, if any */
  application_id: string | null
}

/**
 * Admissions application from HubSpot/SIS (mirrored in Supabase).
 * Staff can attribute unattributed in-progress apps to a referrer.
 */
export interface Application {
  id: string
  last_name: string
  email: string
  status: ReferralStatus
  /** Set when staff links this application to a referral */
  attributed_referral_id: string | null
  created_at: string
}

export interface ReferralRow {
  id: string
  referredFamilyName: string
  referrerName: string
  referrerId: string
  status: ReferralStatus
  submissionMethod: SubmissionMethod
  createdAt: string
  enrolledAt: string | null
  successfulReferralCount: number
  tier: ReferrerTier
}

export interface DashboardMetrics {
  participationRate: number
  totalFamilies: number
  familiesWhoReferred: number
  conversionRate: number
  enrolledReferrals: number
  totalReferrals: number
  industryBenchmarkLow: number
  industryBenchmarkHigh: number
  generalBenchmark: number
  costPerEnrolledReferral: number
  totalRewardCost: number
  avgRetentionMonthsReferred: number
  avgRetentionMonthsNonReferred: number
  /** Referrers bucketed by exact referral count: 1, 2, 3, 4+ */
  referralCountDistribution: { label: string; count: number }[]
}
