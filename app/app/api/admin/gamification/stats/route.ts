
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [
      totalUsers,
      usersWithPoints,
      totalPointsAwarded,
      totalBadgesEarned,
      activeStreaks,
      topUsers,
      badgeStats,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.userPoints.count(),
      prisma.userPoints.aggregate({
        _sum: { totalPoints: true },
      }),
      prisma.userBadge.count(),
      prisma.streak.count({
        where: { currentStreak: { gt: 0 } },
      }),
      prisma.userPoints.findMany({
        take: 5,
        orderBy: { totalPoints: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.badge.findMany({
        include: {
          _count: {
            select: { userBadges: true },
          },
        },
        orderBy: {
          userBadges: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
      prisma.pointTransaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    const stats = {
      overview: {
        totalUsers,
        usersWithPoints,
        engagementRate: totalUsers > 0 ? ((usersWithPoints / totalUsers) * 100).toFixed(1) : '0',
        totalPointsAwarded: totalPointsAwarded._sum.totalPoints || 0,
        totalBadgesEarned,
        activeStreaks,
      },
      topUsers,
      popularBadges: badgeStats,
      recentActivity: recentTransactions,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
