import { emptyRewardFulfillments, syncRewardFulfillments } from './rewardMilestones'
import type {
  Family,
  Referral,
  Referrer,
  ReferrerTier,
  ReferralStatus,
  SubmissionMethod,
} from '../types'

const FIRST_NAMES = [
  'Amelia', 'Noah', 'Olivia', 'Liam', 'Emma', 'Oliver', 'Sophia', 'Elijah',
  'Isabella', 'James', 'Mia', 'William', 'Charlotte', 'Benjamin', 'Harper',
  'Lucas', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Emily', 'Michael',
  'Elizabeth', 'Daniel', 'Sofia', 'Jacob', 'Avery', 'Jackson', 'Ella', 'Sebastian',
  'Scarlett', 'Aiden', 'Grace', 'Matthew', 'Chloe', 'Samuel', 'Camila', 'David',
  'Penelope', 'Joseph', 'Riley', 'Carter', 'Layla', 'Owen', 'Lillian', 'Wyatt',
  'Nora', 'John', 'Zoey', 'Luke', 'Mila', 'Jack', 'Aria', 'Julian', 'Hannah',
  'Levi', 'Addison', 'Isaac', 'Eleanor', 'Gabriel', 'Natalie', 'Julian', 'Zoe',
]

const LAST_NAMES = [
  'Chen', 'Patel', 'Nguyen', 'Garcia', 'Kim', 'Johnson', 'Williams', 'Brown',
  'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
  'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson',
  'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez',
]

function pad(n: number, width = 3): string {
  return String(n).padStart(width, '0')
}

function dateOffset(base: Date, dayOffset: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString()
}

function familyName(i: number): string {
  const last = LAST_NAMES[(i * 7 + (i % FIRST_NAMES.length)) % LAST_NAMES.length]
  return `The ${last} Family`
}

function emailFor(name: string, i: number): string {
  const slug = name
    .replace(/^The\s+/i, '')
    .replace(/\s+Family$/i, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  return `${slug}${i}@example.com`
}

/**
 * Deterministic mock dataset shaped like Supabase tables.
 * ~150 families, ~23 referrers (~15% participation), ~36 referrals.
 */
function buildMockData(): {
  families: Family[]
  referrers: Referrer[]
  referrals: Referral[]
} {
  const baseEnroll = new Date('2024-01-15T12:00:00.000Z')
  const families: Family[] = []

  // 150 enrolled GT families
  for (let i = 1; i <= 150; i++) {
    const name = familyName(i)
    families.push({
      id: `fam_${pad(i)}`,
      name,
      email: emailFor(name, i),
      enrolled_at: dateOffset(baseEnroll, (i * 3) % 520),
      is_referred: false,
      referred_by_id: null,
    })
  }

  // Referrer family indices (1-based) — 23 families ≈ 15.3% participation
  const referrerFamilyIndices = [
    1, 4, 7, 12, 15, 18, 22, 28, 33, 37,
    41, 48, 55, 62, 70, 78, 85, 93, 101, 110,
    118, 129, 140,
  ]

  // Referral counts: steep drop-off after 1 (most stop at a single referral).
  // Target: ~15 at 1, ~4 at 2, ~2 at 3, ~2 at 4+ → sum ≈ 37 referrals.
  const countsByIndex: Record<number, number> = {
    1: 5, 4: 4, 7: 3, 12: 2, 15: 2, 18: 2, 22: 1, 28: 1, 33: 1, 37: 1,
    41: 1, 48: 1, 55: 3, 62: 1, 70: 1, 78: 2, 85: 1, 93: 1, 101: 1, 110: 1,
    118: 1, 129: 1, 140: 1,
  }

  function tierFromCount(count: number): ReferrerTier {
    if (count >= 4) return 3
    if (count >= 2) return 2
    return 1
  }

  // Placeholder referrers; successful counts + rewards filled after referrals are built
  const referrers: Referrer[] = referrerFamilyIndices.map((fi, idx) => {
    const referralCount = countsByIndex[fi]
    return {
      id: `ref_${pad(idx + 1)}`,
      family_id: `fam_${pad(fi)}`,
      tier: tierFromCount(referralCount),
      referral_count: referralCount,
      successful_referral_count: 0,
      reward_fulfillments: emptyRewardFulfillments(),
      created_at: dateOffset(baseEnroll, 30 + idx * 12),
    }
  })

  // Status mix sized for ~37 referrals (~27% enrolled)
  const statuses: ReferralStatus[] = [
    'enrolled', 'enrolled', 'enrolled', 'enrolled', 'enrolled',
    'enrolled', 'enrolled', 'enrolled', 'enrolled', 'enrolled',
    'applied', 'applied', 'applied', 'applied', 'applied',
    'applied', 'applied', 'applied', 'applied',
    'invited', 'invited', 'invited', 'invited', 'invited',
    'invited', 'invited', 'invited', 'invited', 'invited',
    'invited', 'invited', 'invited', 'invited', 'invited',
    'invited', 'invited', 'invited',
  ]

  const methods: SubmissionMethod[] = [
    'link', 'link', 'direct_submit', 'link', 'link',
    'direct_submit', 'link', 'link', 'link', 'direct_submit',
    'link', 'direct_submit', 'link', 'link', 'link',
    'direct_submit', 'link', 'link', 'direct_submit', 'link',
    'link', 'link', 'direct_submit', 'link', 'link',
    'link', 'direct_submit', 'link', 'link', 'link',
    'direct_submit', 'link', 'link', 'link', 'direct_submit',
    'link', 'link',
  ]

  const referredNames = [
    'The Brooks Family', 'The Castillo Family', 'The Duffy Family', 'The Ellis Family',
    'The Farley Family', 'The Gupta Family', 'The Hayes Family', 'The Ibarra Family',
    'The Jain Family', 'The Keller Family', 'The Lang Family', 'The Morales Family',
    'The Nash Family', 'The Ortiz Family', 'The Park Family', 'The Quinn Family',
    'The Reed Family', 'The Soto Family', 'The Tran Family', 'The Underwood Family',
    'The Vega Family', 'The Walsh Family', 'The Xu Family', 'The Yates Family',
    'The Zimmerman Family', 'The Abbott Family', 'The Bennett Family', 'The Cruz Family',
    'The Delgado Family', 'The Everett Family', 'The Frost Family', 'The Grant Family',
    'The Hughes Family', 'The Ingram Family', 'The Jacobs Family', 'The Kane Family',
    'The Lawson Family', 'The Mercer Family',
  ]

  const referrals: Referral[] = []
  let referralNum = 0

  for (const referrer of referrers) {
    const count = referrer.referral_count
    for (let j = 0; j < count; j++) {
      const status = statuses[referralNum] ?? 'invited'
      const method = methods[referralNum] ?? 'link'
      const created = dateOffset(new Date(referrer.created_at), 5 + j * 14 + (referralNum % 5))
      const enrolledAt =
        status === 'enrolled'
          ? dateOffset(new Date(created), 10 + (referralNum % 20))
          : null

      const name = referredNames[referralNum] ?? `The Guest Family ${referralNum + 1}`
      referrals.push({
        id: `referral_${pad(referralNum + 1)}`,
        referrer_id: referrer.id,
        referred_family_name: name,
        referred_email: emailFor(name, 200 + referralNum),
        status,
        submission_method: method,
        created_at: created,
        enrolled_at: enrolledAt,
      })
      referralNum++
    }
  }

  // Credit successful (enrolled) referrals and seed reward fulfillment state
  const enrolledByReferrer = new Map<string, number>()
  for (const referral of referrals) {
    if (referral.status !== 'enrolled') continue
    enrolledByReferrer.set(
      referral.referrer_id,
      (enrolledByReferrer.get(referral.referrer_id) ?? 0) + 1,
    )
  }

  referrers.forEach((referrer, idx) => {
    const successful = enrolledByReferrer.get(referrer.id) ?? 0
    referrer.successful_referral_count = successful
    referrer.reward_fulfillments = syncRewardFulfillments(
      emptyRewardFulfillments(),
      successful,
    )
    if (successful >= 1) {
      if (idx % 3 === 0) {
        referrer.reward_fulfillments[1] = {
          status: 'fulfilled',
          notes: 'GT-branded item mailed',
        }
      } else if (idx % 3 === 1) {
        referrer.reward_fulfillments[1] = {
          status: 'claimed',
          notes: 'Awaiting fulfillment',
        }
      }
    }
    if (successful >= 2 && idx % 5 === 0) {
      referrer.reward_fulfillments[2] = {
        status: 'fulfilled',
        notes: 'Coffee invite sent',
      }
    }
  })

  // Mark some enrolled families as referred (from enrolled referrals + a few extras)
  // Use families that are NOT in the referrer set for is_referred targets
  const referrerFamilyIds = new Set(referrers.map((r) => r.family_id))
  const eligibleTargets = families.filter((f) => !referrerFamilyIds.has(f.id))

  const enrolledReferrals = referrals.filter((r) => r.status === 'enrolled')
  enrolledReferrals.forEach((referral, idx) => {
    const target = eligibleTargets[idx]
    if (!target) return
    const referrer = referrers.find((r) => r.id === referral.referrer_id)!
    target.is_referred = true
    target.referred_by_id = referrer.family_id
    // Align enrolled_at with referral enrolled_at for retention realism
    if (referral.enrolled_at) {
      target.enrolled_at = referral.enrolled_at
    }
  })

  // A few additional referred families (organic / already enrolled via referral before tracker)
  for (let i = enrolledReferrals.length; i < enrolledReferrals.length + 8; i++) {
    const target = eligibleTargets[i]
    if (!target) break
    const referrer = referrers[i % referrers.length]
    target.is_referred = true
    target.referred_by_id = referrer.family_id
    // Slightly newer enrollments for referred cohort variety
    target.enrolled_at = dateOffset(baseEnroll, 200 + i * 11)
  }

  // Retention story: referred families enrolled earlier on average (longer tenure),
  // non-referred skew newer — keeps the comparison chart visually distinct.
  families.forEach((f, idx) => {
    if (f.is_referred) {
      f.enrolled_at = dateOffset(baseEnroll, (idx * 5) % 120)
    } else {
      f.enrolled_at = dateOffset(baseEnroll, 220 + ((idx * 7) % 280))
    }
  })

  return { families, referrers, referrals }
}

export const { families, referrers, referrals } = buildMockData()

/** Assumed reward cost by referrer tier (USD). */
export const TIER_REWARD_COST: Record<ReferrerTier, number> = {
  1: 50,
  2: 125,
  3: 250,
}
