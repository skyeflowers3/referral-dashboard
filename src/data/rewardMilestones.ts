import type { RewardFulfillments, RewardMilestoneAt, RewardStatus } from '../types'

/** Gifts unlocked by successful (enrolled) referral count. No tier names. */
export const REWARD_MILESTONES: { atSuccessful: RewardMilestoneAt; gifts: string[] }[] = [
  {
    atSuccessful: 1,
    gifts: [
      'Named in a collective newsletter thank-you',
      'A GT-branded item',
    ],
  },
  {
    atSuccessful: 2,
    gifts: ['Parent coffee invite'],
  },
  {
    atSuccessful: 3,
    gifts: [
      'Behind-the-scenes campus visit',
      'Early registration window for the next school year',
    ],
  },
  {
    atSuccessful: 4,
    gifts: [
      'Private reception with leadership',
      'Family feature or profile in the newsletter',
    ],
  },
]

export function getEligibleGifts(successfulReferralCount: number): {
  atSuccessful: RewardMilestoneAt
  gifts: string[]
}[] {
  return REWARD_MILESTONES.filter(
    (milestone) => successfulReferralCount >= milestone.atSuccessful,
  )
}

export function emptyRewardFulfillments(): RewardFulfillments {
  return {
    1: { status: 'not_eligible', notes: '' },
    2: { status: 'not_eligible', notes: '' },
    3: { status: 'not_eligible', notes: '' },
    4: { status: 'not_eligible', notes: '' },
  }
}

export function syncRewardFulfillments(
  fulfillments: RewardFulfillments,
  successfulReferralCount: number,
): RewardFulfillments {
  const next = emptyRewardFulfillments()
  for (const milestone of REWARD_MILESTONES) {
    const at = milestone.atSuccessful
    const existing = fulfillments[at]
    if (successfulReferralCount >= at) {
      const status: RewardStatus =
        existing.status === 'not_eligible' ? 'eligible' : existing.status
      next[at] = { status, notes: existing.notes ?? '' }
    } else {
      next[at] = { status: 'not_eligible', notes: existing.notes ?? '' }
    }
  }
  return next
}
