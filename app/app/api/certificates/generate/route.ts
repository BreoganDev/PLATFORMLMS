
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateCertificatePDF } from '@/lib/certificate-generator'
import { triggerCertificateNotification, triggerCompletionNotification } from '@/lib/notification-triggers'

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
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { name: true }
            },
            modules: {
              where: { isPublished: true },
              include: {
                lessons: {
                  where: { isPublished: true },
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Course enrollment not found' },
        { status: 404 }
      )
    }

    // Get all lessons for the course
    const allLessons = enrollment.course.modules.flatMap(module => module.lessons)
    
    // Check completion status
    const completedLessons = await prisma.progress.count({
      where: {
        userId: session.user.id,
        id: { in: allLessons.map(l => l.id) },
        isCompleted: true
      }
    })

    const completionPercentage = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0

    // Require at least 80% completion for certificate
    if (completionPercentage < 80) {
      return NextResponse.json(
        { 
          error: 'Course not sufficiently completed',
          requiredCompletion: 80,
          currentCompletion: Math.round(completionPercentage)
        },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    let certificate = await prisma.certificate.findFirst({
      where: {
        userId: session.user.id,
        courseId
      }
    })

    if (!certificate) {
      // Generate certificate number and validation hash
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const validationHash = Buffer.from(`${session.user.id}-${courseId}-${certificateNumber}`).toString('base64')

      // Create certificate record
      certificate = await prisma.certificate.create({
        data: {
          userId: session.user.id,
          courseId,
          certificateNumber,
          validationHash
        }
      })

      // Trigger completion and certificate notifications (async, don't wait for them)
      Promise.all([
        triggerCompletionNotification(session.user.id, courseId, certificate.id),
        triggerCertificateNotification(session.user.id, courseId, certificate.id, certificate.certificateNumber)
      ]).catch(error => {
        console.error('Failed to send course completion notifications:', error);
      });
    }

    // Update download count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { downloadCount: { increment: 1 } }
    })

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true }
    })

    // Generate PDF certificate
    const certificateData = {
      studentName: user?.name || 'Student',
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor?.name || 'Instructor',
      completionDate: certificate.issuedAt,
      certificateNumber: certificate.certificateNumber,
      validationHash: certificate.validationHash
    }

    const pdfBuffer = await generateCertificatePDF(certificateData)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${enrollment.course.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
