import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Buscar protocolos ativos do paciente com paginação
    const [total, protocols] = await Promise.all([
      prisma.userProtocol.count({
        where: {
          userId: session.user.id,
          status: status as string,
        }
      }),
      prisma.userProtocol.findMany({
        where: {
          userId: session.user.id,
          status: status as string,
        },
        include: {
          protocol: {
            include: {
              days: {
                include: {
                  sessions: {
                    include: {
                      tasks: true
                    }
                  }
                }
              },
              checkinQuestions: true,
              ProtocolDayProgress: {
                where: {
                  userId: session.user.id
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    // Calcular progresso geral para cada protocolo
    const protocolsWithProgress = protocols.map(userProtocol => {
      const totalTasks = userProtocol.protocol.days.reduce((acc, day) => {
        return acc + day.sessions.reduce((sessionAcc, session) => {
          return sessionAcc + session.tasks.length;
        }, 0);
      }, 0);

      const completedTasks = userProtocol.protocol.ProtocolDayProgress.filter(
        progress => progress.isCompleted
      ).length;

      const progress = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

      return {
        ...userProtocol,
        progress,
        totalTasks,
        completedTasks
      };
    });

    return NextResponse.json({
      data: protocolsWithProgress,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching patient protocols:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 