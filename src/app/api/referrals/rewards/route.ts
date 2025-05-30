import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar recompensas do médico
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rewards = await prisma.referralReward.findMany({
      where: {
        doctorId: session.user.id
      },
      include: {
        redemptions: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { redemptions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ rewards });

  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova recompensa
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { title, description, creditsRequired, maxRedemptions } = await req.json();

    if (!title || !description || !creditsRequired) {
      return NextResponse.json(
        { error: 'Título, descrição e créditos necessários são obrigatórios' },
        { status: 400 }
      );
    }

    if (creditsRequired < 1) {
      return NextResponse.json(
        { error: 'Créditos necessários deve ser maior que 0' },
        { status: 400 }
      );
    }

    const reward = await prisma.referralReward.create({
      data: {
        doctorId: session.user.id,
        title,
        description,
        value: parseInt(creditsRequired),
        costInCredits: parseInt(creditsRequired),
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
        isActive: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      reward 
    });

  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar recompensa
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { rewardId, title, description, creditsRequired, maxRedemptions, isActive } = await req.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'ID da recompensa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a recompensa pertence ao médico
    const existingReward = await prisma.referralReward.findFirst({
      where: {
        id: rewardId,
        doctorId: session.user.id
      }
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Recompensa não encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (creditsRequired !== undefined) {
      updateData.value = parseInt(creditsRequired);
      updateData.costInCredits = parseInt(creditsRequired);
    }
    if (maxRedemptions !== undefined) updateData.maxRedemptions = maxRedemptions ? parseInt(maxRedemptions) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const reward = await prisma.referralReward.update({
      where: { id: rewardId },
      data: updateData
    });

    return NextResponse.json({ 
      success: true, 
      reward 
    });

  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar recompensa
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rewardId = searchParams.get('rewardId');

    if (!rewardId) {
      return NextResponse.json(
        { error: 'ID da recompensa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a recompensa pertence ao médico
    const existingReward = await prisma.referralReward.findFirst({
      where: {
        id: rewardId,
        doctorId: session.user.id
      },
      include: {
        _count: {
          select: { redemptions: true }
        }
      }
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Recompensa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há resgates pendentes
    const pendingRedemptions = await prisma.rewardRedemption.count({
      where: {
        rewardId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (pendingRedemptions > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar recompensa com resgates pendentes' },
        { status: 400 }
      );
    }

    await prisma.referralReward.delete({
      where: { id: rewardId }
    });

    return NextResponse.json({ 
      success: true 
    });

  } catch (error) {
    console.error('Erro ao deletar recompensa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 