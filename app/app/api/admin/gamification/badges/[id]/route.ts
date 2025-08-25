
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const badgeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  icon: z.string().min(1).max(10).optional(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
  points: z.number().min(0).max(1000).optional(),
  condition: z.enum([
    'LESSONS_COMPLETED',
    'COURSES_COMPLETED',
    'STREAK_DAYS',
    'TOTAL_POINTS',
    'REVIEWS_WRITTEN',
    'CERTIFICATES_EARNED',
    'FIRST_LESSON',
    'FIRST_COURSE',
    'PERFECT_COURSE',
    'NIGHT_OWL',
    'EARLY_BIRD',
    'WEEKEND_WARRIOR'
  ]).optional(),
  conditionValue: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const badgeId = params.id;
    const body = await request.json();
    const validatedData = badgeUpdateSchema.parse(body);

    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data: validatedData,
    });

    return NextResponse.json(badge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const badgeId = params.id;

    await prisma.badge.delete({
      where: { id: badgeId },
    });

    return NextResponse.json({ message: 'Badge eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
