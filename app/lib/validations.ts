
import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
})

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const categorySchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  description: z.string().optional(),
})

export const courseSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido' }),
  description: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number().min(0, { message: 'El precio debe ser mayor o igual a 0' }),
  categoryId: z.string().min(1, { message: 'La categoría es requerida' }),
  coverImage: z.string().optional(),
})

export const moduleSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido' }),
  orderIndex: z.number().int().positive({ message: 'El índice debe ser un número positivo' }),
})

export const lessonSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido' }),
  content: z.string().optional(),
  vimeoVideoId: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  orderIndex: z.number().int().positive({ message: 'El índice debe ser un número positivo' }),
  isFreePreview: z.boolean().optional(),
})

export const progressSchema = z.object({
  lessonId: z.string().min(1),
  secondsWatched: z.number().int().min(0),
  isCompleted: z.boolean().optional(),
})
