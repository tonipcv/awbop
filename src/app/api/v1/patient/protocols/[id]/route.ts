import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const protocolId = params.id;

    // Buscar protocolo com todos os detalhes e progresso
    const userProtocol = await prisma.userProtocol.findFirst({
      where: {
        protocolId,
        userId: session.user.id
      },
      include: {
        protocol: {
          include: {
            days: {
              include: {
                sessions: {
                  include: {
                    tasks: {
                      include: {
                        ProtocolContent: true,
                        progress: {
                          where: {
                            userId: session.user.id
                          }
                        }
                      }
                    }
                  }
                }
              },
              orderBy: {
                dayNumber: 'asc'
              }
            },
            checkinQuestions: {
              include: {
                responses: {
                  where: {
                    userId: session.user.id
                  },
                  orderBy: {
                    date: 'desc'
                  },
                  take: 1
                }
              }
            },
            symptomReports: {
              where: {
                userId: session.user.id
              },
              orderBy: {
                reportTime: 'desc'
              },
              take: 5
            }
          }
        }
      }
    });

    if (!userProtocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Calcular métricas e progresso
    const totalTasks = userProtocol.protocol.days.reduce((acc, day) => {
      return acc + day.sessions.reduce((sessionAcc, session) => {
        return sessionAcc + session.tasks.length;
      }, 0);
    }, 0);

    const completedTasks = userProtocol.protocol.days.reduce((acc, day) => {
      return acc + day.sessions.reduce((sessionAcc, session) => {
        return sessionAcc + session.tasks.reduce((taskAcc, task) => {
          return taskAcc + (task.progress.some(p => p.isCompleted) ? 1 : 0);
        }, 0);
      }, 0);
    }, 0);

    // Calcular progresso por dia
    const daysProgress = userProtocol.protocol.days.map(day => {
      const dayTotalTasks = day.sessions.reduce((acc, session) => {
        return acc + session.tasks.length;
      }, 0);

      const dayCompletedTasks = day.sessions.reduce((acc, session) => {
        return acc + session.tasks.reduce((taskAcc, task) => {
          return taskAcc + (task.progress.some(p => p.isCompleted) ? 1 : 0);
        }, 0);
      }, 0);

      return {
        dayNumber: day.dayNumber,
        totalTasks: dayTotalTasks,
        completedTasks: dayCompletedTasks,
        progress: dayTotalTasks > 0 
          ? Math.round((dayCompletedTasks / dayTotalTasks) * 100)
          : 0
      };
    });

    const response = {
      ...userProtocol,
      metrics: {
        totalTasks,
        completedTasks,
        overallProgress: totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0,
        daysProgress
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching protocol details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 