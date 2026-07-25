export type ReferralStatus = 'invited' | 'applied' | 'enrolled'
export type SubmissionMethod = 'link' | 'direct_submit'
export type ReferrerTier = 1 | 2 | 3

export interface Family {
  id: string
  name: string
  email: string
  enrolled_at: string
  is_referred: boolean
  referred_by_id: string | null
}

export interface Referrer {
  id: string
  family_id: string
  tier: ReferrerTier
  referral_count: number
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
}

export interface ReferralRow {
  id: string
  referredFamilyName: string
  referrerName: string
  status: ReferralStatus
  submissionMethod: SubmissionMethod
  createdAt: string
  enrolledAt: string | null
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
