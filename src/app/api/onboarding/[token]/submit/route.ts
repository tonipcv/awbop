import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Answer {
  stepId: string;
  answer: string;
}

interface OnboardingStep {
  id: string;
  required: boolean;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await context.params;
    const { email, answers } = await request.json();

    if (!token || !email || !answers) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    // Find response by token
    const response = await prisma.onboardingResponse.findUnique({
      where: { token },
      include: {
        template: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // If already completed, return error
    if (response.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This form has already been submitted" },
        { status: 400 }
      );
    }

    // Validate if all required questions were answered
    const requiredSteps = response.template.steps.filter((step: OnboardingStep) => step.required);
    const answeredStepIds = answers.map((a: Answer) => a.stepId);
    const missingRequired = requiredSteps.some(
      (step: OnboardingStep) => !answeredStepIds.includes(step.id)
    );

    if (missingRequired) {
      return NextResponse.json(
        { error: "Please answer all required questions" },
        { status: 400 }
      );
    }

    // Update email and response status
    await prisma.onboardingResponse.update({
      where: { id: response.id },
      data: {
        email,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Save answers
    await prisma.onboardingAnswer.createMany({
      data: answers.map((answer: Answer) => ({
        responseId: response.id,
        stepId: answer.stepId,
        answer: answer.answer,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting responses:", error);
    return NextResponse.json(
      { error: "Error submitting responses" },
      { status: 500 }
    );
  }
} 