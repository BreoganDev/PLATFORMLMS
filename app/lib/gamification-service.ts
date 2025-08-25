import { prisma } from './db';
import type { PointTransactionType, BadgeCondition, LeaderboardType, LeaderboardPeriod } from '@prisma/client';

// Valores de puntos para cada tipo de transacción
const POINT_VALUES: Record<PointTransactionType, number> = {
  LESSON_COMPLETED: 10,
  COURSE_COMPLETED: 100,
  REVIEW_WRITTEN: 15,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 20,
  FIRST_TIME_BONUS: 50,
  BADGE_EARNED: 25,
  ADMIN_ADJUSTMENT: 0, // ✅ Añadido el valor faltante
};

export class GamificationService {
  /**
   * Award points to a user
   */
  static async awardPoints(
    userId: string,
    type: PointTransactionType,
    description: string,
    customPoints?: number,
    metadata?: any
  ) {
    const points = customPoints ?? POINT_VALUES[type];

    // Create point transaction
    await prisma.pointTransaction.create({
      data: {
        userId,
        points,
        type,
        description,
        metadata,
      },
    });

    // Update user points
    await prisma.userPoints.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        lessonPoints: type === 'LESSON_COMPLETED' ? { increment: points } : undefined,
        coursePoints: type === 'COURSE_COMPLETED' ? { increment: points } : undefined,
        streakPoints: type === 'STREAK_BONUS' ? { increment: points } : undefined,
        badgePoints: type === 'BADGE_EARNED' ? { increment: points } : undefined,
        reviewPoints: type === 'REVIEW_WRITTEN' ? { increment: points } : undefined,
      },
      create: {
        userId,
        totalPoints: points,
        lessonPoints: type === 'LESSON_COMPLETED' ? points : 0,
        coursePoints: type === 'COURSE_COMPLETED' ? points : 0,
        streakPoints: type === 'STREAK_BONUS' ? points : 0,
        badgePoints: type === 'BADGE_EARNED' ? points : 0,
        reviewPoints: type === 'REVIEW_WRITTEN' ? points : 0,
      },
    });

    // Update level if necessary
    await this.updateUserLevel(userId);

    return points;
  }

  /**
   * Update user level based on total points
   */
  static async updateUserLevel(userId: string) {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) return;

    const newLevel = this.calculateLevel(userPoints.totalPoints);
    const pointsForCurrentLevel = this.getPointsForLevel(newLevel);
    const pointsForNextLevel = this.getPointsForLevel(newLevel + 1);

    await prisma.userPoints.update({
      where: { userId },
      data: {
        level: newLevel,
        currentLevelPoints: userPoints.totalPoints - pointsForCurrentLevel,
        pointsToNextLevel: pointsForNextLevel - userPoints.totalPoints,
      },
    });
  }

  /**
   * Calculate level based on total points
   */
  static calculateLevel(totalPoints: number): number {
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  /**
   * Get points required for a specific level
   */
  static getPointsForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  /**
   * Check and award badges to user
   */
  static async checkAndAwardBadges(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPoints: true,
        userBadges: {
          include: { badge: true }
        },
        progress: {
          where: { isCompleted: true }
        },
        enrollments: true,
        reviews: true,
        certificates: true,
        streak: true,
      },
    });

    if (!user) return [];

    const badges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    const newBadges = [];

    for (const badge of badges) {
      // Check if user already has this badge
      const hasBadge = user.userBadges.some(ub => ub.badgeId === badge.id);
      if (hasBadge) continue;

      let shouldAward = false;

      switch (badge.condition) {
        case 'FIRST_LESSON':
          shouldAward = user.progress.length >= 1;
          break;
        case 'FIRST_COURSE':
          shouldAward = user.enrollments.length >= 1;
          break;
        case 'LESSONS_COMPLETED':
          shouldAward = user.progress.length >= (badge.conditionValue || 0);
          break;
        case 'COURSES_COMPLETED':
          shouldAward = user.enrollments.length >= (badge.conditionValue || 0);
          break;
        case 'TOTAL_POINTS':
          shouldAward = (user.userPoints?.totalPoints || 0) >= (badge.conditionValue || 0);
          break;
        case 'STREAK_DAYS':
          shouldAward = (user.streak?.currentStreak || 0) >= (badge.conditionValue || 0);
          break;
        case 'REVIEWS_WRITTEN':
          shouldAward = user.reviews.length >= (badge.conditionValue || 0);
          break;
        case 'CERTIFICATES_EARNED':
          shouldAward = user.certificates.length >= (badge.conditionValue || 0);
          break;
        // Add more conditions as needed
      }

      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        // Award points for earning the badge
        await this.awardPoints(
          userId,
          'BADGE_EARNED',
          `Badge earned: ${badge.name}`,
          badge.points
        );

        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  /**
   * Update user streak
   */
  static async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create initial streak
      await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          streakStartDate: today,
        },
      });
      
      await this.awardPoints(userId, 'DAILY_LOGIN', 'Daily login streak started');
      return 1;
    }

    const lastActivity = streak.lastActivityDate;
    if (!lastActivity) return streak.currentStreak;

    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff === 0) {
      // Same day, no change
      return streak.currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day
      const newStreak = streak.currentStreak + 1;
      const newLongest = Math.max(streak.longestStreak, newStreak);

      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
        },
      });

      await this.awardPoints(userId, 'DAILY_LOGIN', 'Daily login streak continued');

      // Bonus points for longer streaks
      if (newStreak % 7 === 0) {
        await this.awardPoints(userId, 'STREAK_BONUS', `${newStreak} day streak bonus`);
      }

      return newStreak;
    } else {
      // Streak broken
      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityDate: today,
          streakStartDate: today,
        },
      });

      await this.awardPoints(userId, 'DAILY_LOGIN', 'Daily login (streak restarted)');
      return 1;
    }
  }

  /**
   * Get user profile with gamification data
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPoints: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
        streak: true,
      },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      points: user.userPoints || {
        totalPoints: 0,
        currentLevelPoints: 0,
        level: 1,
        pointsToNextLevel: 100,
        lessonPoints: 0,
        coursePoints: 0,
        streakPoints: 0,
        badgePoints: 0,
        reviewPoints: 0,
      },
      badges: user.userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      streak: user.streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
      },
    };
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number = 10
  ) {
    // This is a simplified implementation
    // In a real app, you'd want more sophisticated period filtering
    
    let orderBy: any = {};
    let include: any = {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    };

    switch (type) {
      case 'TOTAL_POINTS':
        const pointsLeaderboard = await prisma.userPoints.findMany({
          include: include.user,
          orderBy: { totalPoints: 'desc' },
          take: limit,
        });
        
        return pointsLeaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          user: entry.user,
          score: entry.totalPoints,
          type,
          period,
        }));

      case 'CURRENT_STREAK':
        const streakLeaderboard = await prisma.streak.findMany({
          include: include.user,
          orderBy: { currentStreak: 'desc' },
          take: limit,
        });
        
        return streakLeaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          user: entry.user,
          score: entry.currentStreak,
          type,
          period,
        }));

      default:
        return [];
    }
  }
}