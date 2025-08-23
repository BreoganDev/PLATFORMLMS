
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateNumber = searchParams.get('number')
    const validationHash = searchParams.get('hash')

    if (!certificateNumber || !validationHash) {
      return NextResponse.json(
        { error: 'Certificate number and validation hash are required' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        certificateNumber,
        validationHash
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true },
          include: {
            instructor: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          valid: false,
          message: 'Certificate not found or invalid'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        number: certificate.certificateNumber,
        studentName: certificate.user.name,
        courseName: certificate.course.title,
        instructorName: certificate.course.instructor?.name,
        issuedAt: certificate.issuedAt,
        downloadCount: certificate.downloadCount
      }
    })

  } catch (error) {
    console.error('Certificate validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
