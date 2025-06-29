import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/onboarding/templates/public - Listar templates públicos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é médico
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Acesso negado. Apenas médicos podem visualizar templates.' }, { status: 403 });
    }

    // Buscar templates públicos de outros médicos
    const templates = await prisma.onboardingTemplate.findMany({
      where: {
        isPublic: true,
        isActive: true,
        NOT: {
          doctorId: session.user.id // Excluir templates do próprio médico
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        doctor: {
          select: {
            name: true,
            email: true
          }
        },
        steps: {
          select: {
            id: true,
            question: true,
            description: true,
            type: true,
            options: true,
            required: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching public templates:', error);
    return NextResponse.json({ error: 'Erro ao buscar templates públicos' }, { status: 500 });
  }
}

// POST /api/onboarding/templates/public/:id/clone - Clonar um template público
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é médico
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Acesso negado. Apenas médicos podem clonar templates.' }, { status: 403 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: "ID do template é obrigatório" }, { status: 400 });
    }

    // Buscar o template original
    const originalTemplate = await prisma.onboardingTemplate.findFirst({
      where: {
        id: templateId,
        isPublic: true,
        isActive: true
      },
      include: {
        steps: true
      }
    });

    if (!originalTemplate) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    // Criar uma cópia do template
    const clonedTemplate = await prisma.onboardingTemplate.create({
      data: {
        name: `${originalTemplate.name} (Cópia)`,
        description: originalTemplate.description,
        doctorId: session.user.id,
        isActive: true,
        isPublic: false,
        welcomeTitle: originalTemplate.welcomeTitle,
        welcomeDescription: originalTemplate.welcomeDescription,
        welcomeItems: originalTemplate.welcomeItems,
        estimatedTime: originalTemplate.estimatedTime,
        welcomeVideoUrl: originalTemplate.welcomeVideoUrl,
        welcomeButtonText: originalTemplate.welcomeButtonText,
        successTitle: originalTemplate.successTitle,
        successDescription: originalTemplate.successDescription,
        successVideoUrl: originalTemplate.successVideoUrl,
        successButtonText: originalTemplate.successButtonText,
        successButtonUrl: originalTemplate.successButtonUrl,
        nextSteps: originalTemplate.nextSteps,
        contactEmail: originalTemplate.contactEmail,
        contactPhone: originalTemplate.contactPhone,
        steps: {
          create: originalTemplate.steps.map(step => ({
            question: step.question,
            description: step.description,
            type: step.type,
            options: step.options,
            required: step.required,
            order: step.order,
            showToDoctor: step.showToDoctor
          }))
        }
      }
    });

    return NextResponse.json(clonedTemplate);
  } catch (error) {
    console.error('Error cloning template:', error);
    return NextResponse.json({ error: 'Erro ao clonar template' }, { status: 500 });
  }
} 