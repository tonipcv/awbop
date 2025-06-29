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

    // Buscar dias do protocolo (que representam as fases)
    const protocolDays = await prisma.protocolDay.findMany({
      where: {
        protocolId
      },
      include: {
        sessions: {
          include: {
            tasks: {
              include: {
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
    });

    // Calcular progresso para cada fase (dia)
    const phases = protocolDays.map(day => {
      const totalTasks = day.sessions.reduce((acc, session) => {
        return acc + session.tasks.length;
      }, 0);

      const completedTasks = day.sessions.reduce((acc, session) => {
        return acc + session.tasks.reduce((taskAcc, task) => {
          return taskAcc + (task.progress.some(p => p.isCompleted) ? 1 : 0);
        }, 0);
      }, 0);

      // Determinar status da fase
      let status = 'PENDING';
      if (completedTasks === totalTasks) {
        status = 'COMPLETED';
      } else if (completedTasks > 0) {
        status = 'IN_PROGRESS';
      }

      // Calcular data estimada baseada no dia do protocolo
      const startDate = new Date(userProtocol.startDate);
      const estimatedDate = new Date(startDate);
      estimatedDate.setDate(startDate.getDate() + (day.dayNumber - 1));

      return {
        phaseNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        status,
        estimatedDate,
        progress: totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0,
        metrics: {
          totalTasks,
          completedTasks,
          totalSessions: day.sessions.length
        },
        sessions: day.sessions.map(session => ({
          id: session.id,
          title: session.title,
          description: session.description,
          sessionNumber: session.sessionNumber,
          totalTasks: session.tasks.length,
          completedTasks: session.tasks.filter(task => 
            task.progress.some(p => p.isCompleted)
          ).length
        }))
      };
    });

    // Identificar fase atual
    const currentPhaseIndex = phases.findIndex(phase => 
      phase.status === 'IN_PROGRESS' || phase.status === 'PENDING'
    );

    const response = {
      totalPhases: phases.length,
      currentPhase: currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : phases.length,
      phases
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching protocol phases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 