import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyMobileAuth } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';

// GET /api/protocols/assignments - Listar protocolos atribuídos ao paciente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Buscar o paciente e seus médicos ativos
    const patient = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patientRelationships: {
          where: { isActive: true },
          include: {
            doctor: true
          }
        }
      }
    });

    if (!patient || patient.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Access denied. Only patients can access this feature.' }, { status: 403 });
    }

    // 2. Pegar IDs de todos os médicos ativos
    const activeDoctorIds = patient.patientRelationships.map(rel => rel.doctorId);

    // 3. Buscar todos os protocolos atribuídos por qualquer médico ativo
    const assignments = await prisma.userProtocol.findMany({
      where: {
        userId: patient.id,
        protocol: {
          doctorId: {
            in: activeDoctorIds
          }
        }
      },
      include: {
        protocol: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            days: {
              include: {
                sessions: {
                  include: {
                    tasks: true
                  },
                  orderBy: {
                    sessionNumber: 'asc'
                  }
                }
              },
              orderBy: {
                dayNumber: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching patient protocols:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 