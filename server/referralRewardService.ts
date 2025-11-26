/**
 * Referral Reward Service
 *
 * Handles XP rewards for the referral/invitation system
 * This service is designed to award bonuses when new users complete their first training session
 *
 * Reward Structure:
 * - Referrer (inviter): 500 XP
 * - Referee (new user): 300 XP
 */

import { storage } from "./storage.js";

/**
 * Awards referral bonuses when a new user completes their first training session
 *
 * @param {string} newUserId - The ID of the new user who was referred
 * @returns {Promise<{referrerReward: number, refereeReward: number} | null>} Reward amounts or null if no referral
 */
export async function awardReferralRewards(newUserId: string): Promise<{
  referrerReward: number;
  refereeReward: number;
} | null> {
  try {
    // Get the new user
    const newUser = await storage.getUser(newUserId);
    if (!newUser) {
      console.error(`Referral reward: User ${newUserId} not found`);
      return null;
    }

    // Check if user was referred
    if (!newUser.referredByUserId) {
      console.log(`Referral reward: User ${newUserId} was not referred, no rewards to award`);
      return null;
    }

    const referrerId = newUser.referredByUserId;

    // Award XP to referrer (500 XP)
    const referrer = await storage.getUser(referrerId);
    if (referrer) {
      const newReferrerExp = (referrer.exp || 0) + 500;
      await storage.updateUser(referrerId, {
        exp: newReferrerExp,
      });
      console.log(`Referral reward: Awarded 500 XP to referrer ${referrerId} (new total: ${newReferrerExp})`);
    } else {
      console.warn(`Referral reward: Referrer ${referrerId} not found`);
    }

    // Award XP to new user (300 XP)
    const newUserExp = (newUser.exp || 0) + 300;
    await storage.updateUser(newUserId, {
      exp: newUserExp,
    });
    console.log(`Referral reward: Awarded 300 XP to new user ${newUserId} (new total: ${newUserExp})`);

    return {
      referrerReward: 500,
      refereeReward: 300,
    };

  } catch (error) {
    console.error('Referral reward error:', error);
    return null;
  }
}

/**
 * Checks if a user has already received their referral signup bonus
 * This prevents duplicate reward grants
 *
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} True if user has already received bonus, false otherwise
 */
export async function hasReceivedReferralBonus(userId: string): Promise<boolean> {
  // TODO: Implement tracking mechanism (e.g., new database field or achievement record)
  // For now, we'll assume users only get the bonus once on their first training session
  // This can be enhanced with a dedicated tracking field in the users table

  try {
    const user = await storage.getUser(userId);
    if (!user) return false;

    // Simple heuristic: if user has 0 training sessions, they haven't received the bonus yet
    // This is a placeholder - proper implementation would use a dedicated flag
    const sessions = await storage.getUserTrainingSessions(userId);
    return sessions.length > 0;
  } catch (error) {
    console.error('Error checking referral bonus status:', error);
    return false;
  }
}

/**
 * Future enhancement: Get referral statistics for a user
 *
 * @param {string} userId - The user ID
 * @returns {Promise<{totalInvited: number, activeReferrals: number, totalRewardsEarned: number}>}
 */
export async function getReferralStats(userId: string): Promise<{
  totalInvited: number;
  activeReferrals: number;
  totalRewardsEarned: number;
}> {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return {
        totalInvited: 0,
        activeReferrals: 0,
        totalRewardsEarned: 0,
      };
    }

    const totalInvited = user.invitedCount || 0;

    // TODO: Implement active referrals tracking (users who completed at least one session)
    // TODO: Implement total rewards tracking (sum of all referral bonuses)

    return {
      totalInvited,
      activeReferrals: 0,  // Placeholder for future implementation
      totalRewardsEarned: totalInvited * 500,  // Simple calculation: 500 XP per referral
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return {
      totalInvited: 0,
      activeReferrals: 0,
      totalRewardsEarned: 0,
    };
  }
}
