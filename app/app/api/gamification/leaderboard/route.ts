
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification-service';
import type { LeaderboardType, LeaderboardPeriod } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as LeaderboardType || 'TOTAL_POINTS';
    const period = searchParams.get('period') as LeaderboardPeriod || 'ALL_TIME';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate parameters
    const validTypes: LeaderboardType[] = [
      'TOTAL_POINTS',
      'CURRENT_STREAK',
      'LESSONS_COMPLETED',
      'COURSES_COMPLETED',
      'BADGES_EARNED'
    ];
    
    const validPeriods: LeaderboardPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de leaderboard inválido' }, { status: 400 });
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Período inválido' }, { status: 400 });
    }

    const leaderboard = await GamificationService.getLeaderboard(type, period, limit);

    // Find current user's position if not in top results
    const userPosition = leaderboard.find(entry => entry.userId === session.user.id);
    
    return NextResponse.json({
      leaderboard,
      userPosition: userPosition || null,
      type,
      period,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
