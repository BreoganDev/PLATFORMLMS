
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { initializeDefaultBadges } from '@/lib/badge-definitions';
import { z } from 'zod';

const badgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().min(1).max(10),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  points: z.number().min(0).max(1000),
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
  ]),
  conditionValue: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const badges = await prisma.badge.findMany({
      include: {
        userBadges: {
          select: { id: true },
        },
        _count: {
          select: { userBadges: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check for initialization request
    if (body.action === 'initialize') {
      await initializeDefaultBadges();
      return NextResponse.json({ message: 'Badges por defecto inicializados' });
    }

    const validatedData = badgeSchema.parse(body);

    const badge = await prisma.badge.create({
      data: validatedData,
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
