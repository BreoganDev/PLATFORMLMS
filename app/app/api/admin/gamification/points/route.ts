
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification-service';
import { z } from 'zod';

const pointAdjustmentSchema = z.object({
  userId: z.string(),
  points: z.number().min(-10000).max(10000),
  description: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, points, description } = pointAdjustmentSchema.parse(body);

    await GamificationService.awardPoints(
      userId,
      'ADMIN_ADJUSTMENT',
      description,
      { adjustedBy: session.user.id }
    );

    return NextResponse.json({ 
      message: `${points > 0 ? 'Otorgados' : 'Deducidos'} ${Math.abs(points)} puntos exitosamente` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adjusting points:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
