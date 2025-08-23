
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, rating, comment } = body

    // Validate input
    if (!courseId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid course ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to leave a review' },
        { status: 403 }
      )
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      },
      update: {
        rating,
        comment: comment?.trim() || null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        courseId,
        rating,
        comment: comment?.trim() || null
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        courseId,
        isPublished: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
