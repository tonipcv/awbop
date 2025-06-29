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
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Construir query para progresso
    const progressWhere = {
      userId: session.user.id,
      protocolId,
      ...(startDate && endDate ? {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {})
    };

    // Buscar progresso detalhado
    const [progress, symptoms, checkins] = await Promise.all([
      // Progresso das tarefas
      prisma.protocolDayProgress.findMany({
        where: progressWhere,
        include: {
          protocolTask: true
        },
        orderBy: [
          { dayNumber: 'asc' },
          { date: 'asc' }
        ]
      }),
      // Relatórios de sintomas
      prisma.symptomReport.findMany({
        where: {
          userId: session.user.id,
          protocolId,
          ...(startDate && endDate ? {
            reportTime: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        orderBy: {
          reportTime: 'desc'
        }
      }),
      // Check-ins diários
      prisma.dailyCheckinResponse.findMany({
        where: {
          userId: session.user.id,
          protocolId,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          question: true
        },
        orderBy: {
          date: 'desc'
        }
      })
    ]);

    // Agrupar progresso por dia
    const progressByDay = progress.reduce((acc, curr) => {
      const day = curr.dayNumber;
      if (!acc[day]) {
        acc[day] = {
          dayNumber: day,
          date: curr.date,
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

    // Calcular métricas gerais
    const totalTasks = progress.length;
    const completedTasks = progress.filter(p => p.isCompleted).length;
    const totalDays = Object.keys(progressByDay).length;
    const completedDays = Object.values(progressByDay)
      .filter(day => day.completedTasks === day.totalTasks).length;

    const response = {
      overview: {
        totalTasks,
        completedTasks,
        totalDays,
        completedDays,
        overallProgress: totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0,
        daysProgress: totalDays > 0
          ? Math.round((completedDays / totalDays) * 100)
          : 0
      },
      progressByDay: Object.values(progressByDay),
      symptoms,
      checkins
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching protocol progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 