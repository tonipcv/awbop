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

    // Validar acesso ao protocolo
    const userProtocol = await prisma.userProtocol.findFirst({
      where: {
        protocolId,
        userId: session.user.id
      }
    });

    if (!userProtocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Buscar progresso atual do protocolo
    const progress = await prisma.protocolDayProgress.findMany({
      where: {
        userId: session.user.id,
        protocolId
      },
      include: {
        protocolTask: true
      },
      orderBy: {
        dayNumber: 'asc'
      }
    });

    // Agrupar progresso por dia
    const progressByDay = progress.reduce((acc, curr) => {
      const day = curr.dayNumber;
      if (!acc[day]) {
        acc[day] = {
          dayNumber: day,
          tasks: [],
          completedTasks: 0,
          totalTasks: 0
        };
      }
      
      acc[day].tasks.push(curr);
      acc[day].totalTasks++;
      if (curr.isCompleted) {
        acc[day].completedTasks++;
      }
      
      return acc;
    }, {} as Record<number, any>);

    // Encontrar o dia atual (primeiro dia não completado ou em progresso)
    const currentDayNumber = Object.values(progressByDay).find((day: any) => 
      day.completedTasks < day.totalTasks
    )?.dayNumber || userProtocol.currentDay;

    // Buscar detalhes da fase atual
    const currentPhase = await prisma.protocolDay.findFirst({
      where: {
        protocolId,
        dayNumber: currentDayNumber
      },
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
          },
          orderBy: {
            sessionNumber: 'asc'
          }
        }
      }
    });

    if (!currentPhase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Calcular métricas da fase atual
    const totalTasks = currentPhase.sessions.reduce((acc, session) => {
      return acc + session.tasks.length;
    }, 0);

    const completedTasks = currentPhase.sessions.reduce((acc, session) => {
      return acc + session.tasks.reduce((taskAcc, task) => {
        return taskAcc + (task.progress.some(p => p.isCompleted) ? 1 : 0);
      }, 0);
    }, 0);

    // Buscar check-ins e sintomas do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCheckins, todaySymptoms] = await Promise.all([
      prisma.dailyCheckinResponse.findMany({
        where: {
          userId: session.user.id,
          protocolId,
          date: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          question: true
        }
      }),
      prisma.symptomReport.findMany({
        where: {
          userId: session.user.id,
          protocolId,
          dayNumber: currentDayNumber,
          reportTime: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    const response = {
      phaseNumber: currentPhase.dayNumber,
      title: currentPhase.title,
      description: currentPhase.description,
      progress: totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      metrics: {
        totalTasks,
        completedTasks,
        totalSessions: currentPhase.sessions.length,
        completedSessions: currentPhase.sessions.filter(session =>
          session.tasks.every(task => task.progress.some(p => p.isCompleted))
        ).length
      },
      sessions: currentPhase.sessions.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        sessionNumber: session.sessionNumber,
        tasks: session.tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type,
          duration: task.duration,
          content: task.ProtocolContent,
          isCompleted: task.progress.some(p => p.isCompleted),
          completedAt: task.progress.find(p => p.isCompleted)?.completedAt
        }))
      })),
      todayCheckins,
      todaySymptoms
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching current phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 