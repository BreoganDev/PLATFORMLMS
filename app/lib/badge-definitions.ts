
import type { BadgeCondition, BadgeRarity } from '@prisma/client';

export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  points: number;
  condition: BadgeCondition;
  conditionValue?: number;
  isActive: boolean;
}

export const DEFAULT_BADGES: BadgeDefinition[] = [
  // First time badges
  {
    name: 'Primera Lección',
    description: 'Completaste tu primera lección',
    icon: '🎯',
    rarity: 'COMMON',
    points: 10,
    condition: 'FIRST_LESSON',
    isActive: true,
  },
  {
    name: 'Primer Curso',
    description: 'Completaste tu primer curso completo',
    icon: '🏆',
    rarity: 'COMMON',
    points: 25,
    condition: 'FIRST_COURSE',
    isActive: true,
  },

  // Lesson completion badges
  {
    name: 'Estudiante Activo',
    description: 'Completa 10 lecciones',
    icon: '📚',
    rarity: 'COMMON',
    points: 15,
    condition: 'LESSONS_COMPLETED',
    conditionValue: 10,
    isActive: true,
  },
  {
    name: 'Devorador de Conocimiento',
    description: 'Completa 50 lecciones',
    icon: '🧠',
    rarity: 'UNCOMMON',
    points: 30,
    condition: 'LESSONS_COMPLETED',
    conditionValue: 50,
    isActive: true,
  },
  {
    name: 'Maestro del Aprendizaje',
    description: 'Completa 100 lecciones',
    icon: '🎓',
    rarity: 'RARE',
    points: 50,
    condition: 'LESSONS_COMPLETED',
    conditionValue: 100,
    isActive: true,
  },

  // Course completion badges
  {
    name: 'Explorador',
    description: 'Completa 3 cursos',
    icon: '🗺️',
    rarity: 'COMMON',
    points: 20,
    condition: 'COURSES_COMPLETED',
    conditionValue: 3,
    isActive: true,
  },
  {
    name: 'Coleccionista',
    description: 'Completa 10 cursos',
    icon: '📋',
    rarity: 'UNCOMMON',
    points: 40,
    condition: 'COURSES_COMPLETED',
    conditionValue: 10,
    isActive: true,
  },
  {
    name: 'Experto Multidisciplinario',
    description: 'Completa 25 cursos',
    icon: '🌟',
    rarity: 'RARE',
    points: 75,
    condition: 'COURSES_COMPLETED',
    conditionValue: 25,
    isActive: true,
  },

  // Streak badges
  {
    name: 'Racha de Fuego',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    rarity: 'COMMON',
    points: 25,
    condition: 'STREAK_DAYS',
    conditionValue: 7,
    isActive: true,
  },
  {
    name: 'Imparable',
    description: 'Mantén una racha de 30 días',
    icon: '⚡',
    rarity: 'UNCOMMON',
    points: 50,
    condition: 'STREAK_DAYS',
    conditionValue: 30,
    isActive: true,
  },
  {
    name: 'Leyenda de Constancia',
    description: 'Mantén una racha de 100 días',
    icon: '👑',
    rarity: 'EPIC',
    points: 100,
    condition: 'STREAK_DAYS',
    conditionValue: 100,
    isActive: true,
  },

  // Points badges
  {
    name: 'Escalando',
    description: 'Alcanza 500 puntos',
    icon: '⬆️',
    rarity: 'COMMON',
    points: 20,
    condition: 'TOTAL_POINTS',
    conditionValue: 500,
    isActive: true,
  },
  {
    name: 'Alto Rendimiento',
    description: 'Alcanza 2,000 puntos',
    icon: '💎',
    rarity: 'UNCOMMON',
    points: 40,
    condition: 'TOTAL_POINTS',
    conditionValue: 2000,
    isActive: true,
  },
  {
    name: 'Elite del Aprendizaje',
    description: 'Alcanza 5,000 puntos',
    icon: '💠',
    rarity: 'RARE',
    points: 75,
    condition: 'TOTAL_POINTS',
    conditionValue: 5000,
    isActive: true,
  },
  {
    name: 'Supernova',
    description: 'Alcanza 10,000 puntos',
    icon: '🌟',
    rarity: 'EPIC',
    points: 150,
    condition: 'TOTAL_POINTS',
    conditionValue: 10000,
    isActive: true,
  },
  {
    name: 'Maestro Absoluto',
    description: 'Alcanza 25,000 puntos',
    icon: '🏅',
    rarity: 'LEGENDARY',
    points: 250,
    condition: 'TOTAL_POINTS',
    conditionValue: 25000,
    isActive: true,
  },

  // Review badges
  {
    name: 'Crítico Constructivo',
    description: 'Escribe 5 reseñas',
    icon: '✍️',
    rarity: 'COMMON',
    points: 15,
    condition: 'REVIEWS_WRITTEN',
    conditionValue: 5,
    isActive: true,
  },
  {
    name: 'Voz de la Comunidad',
    description: 'Escribe 25 reseñas',
    icon: '📢',
    rarity: 'UNCOMMON',
    points: 35,
    condition: 'REVIEWS_WRITTEN',
    conditionValue: 25,
    isActive: true,
  },

  // Certificate badges
  {
    name: 'Certificado',
    description: 'Obtén tu primer certificado',
    icon: '📜',
    rarity: 'COMMON',
    points: 30,
    condition: 'CERTIFICATES_EARNED',
    conditionValue: 1,
    isActive: true,
  },
  {
    name: 'Coleccionista de Logros',
    description: 'Obtén 5 certificados',
    icon: '🏆',
    rarity: 'UNCOMMON',
    points: 60,
    condition: 'CERTIFICATES_EARNED',
    conditionValue: 5,
    isActive: true,
  },
  {
    name: 'Academia de Honor',
    description: 'Obtén 15 certificados',
    icon: '🎖️',
    rarity: 'RARE',
    points: 120,
    condition: 'CERTIFICATES_EARNED',
    conditionValue: 15,
    isActive: true,
  },

  // Special badges
  {
    name: 'Perfeccionista',
    description: 'Completa un curso con puntuación perfecta',
    icon: '💯',
    rarity: 'RARE',
    points: 50,
    condition: 'PERFECT_COURSE',
    conditionValue: 1,
    isActive: true,
  },
  {
    name: 'Búho Nocturno',
    description: 'Estudia 10 veces después de las 10 PM',
    icon: '🦉',
    rarity: 'UNCOMMON',
    points: 30,
    condition: 'NIGHT_OWL',
    conditionValue: 10,
    isActive: true,
  },
  {
    name: 'Madrugador',
    description: 'Estudia 10 veces antes de las 6 AM',
    icon: '🌅',
    rarity: 'UNCOMMON',
    points: 30,
    condition: 'EARLY_BIRD',
    conditionValue: 10,
    isActive: true,
  },
  {
    name: 'Guerrero del Fin de Semana',
    description: 'Estudia 5 fines de semana consecutivos',
    icon: '⚔️',
    rarity: 'RARE',
    points: 45,
    condition: 'WEEKEND_WARRIOR',
    conditionValue: 5,
    isActive: true,
  },
];

/**
 * Initialize default badges in the database
 */
export async function initializeDefaultBadges() {
  const { prisma } = await import('./db');
  
  for (const badgeData of DEFAULT_BADGES) {
    try {
      await prisma.badge.upsert({
        where: { name: badgeData.name },
        update: badgeData,
        create: badgeData,
      });
    } catch (error) {
      console.error(`Error creating badge ${badgeData.name}:`, error);
    }
  }
  
  console.log('Default badges initialized');
}
