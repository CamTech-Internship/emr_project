import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const sendMessageSchema = z.object({
  toId: z.string(),
  body: z.string().min(1),
  threadId: z.string().optional(),
});

/**
 * Get patient's messages
 * GET /api/patient/messages
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT", "DOCTOR"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;

    // Fetch messages sent and received
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      include: {
        from: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        to: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Send a message
 * POST /api/patient/messages
 */
export async function POST(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT", "DOCTOR"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;
    const body = await req.json();
    const { toId, body: messageBody, threadId } = sendMessageSchema.parse(body);

    // Verify the recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: toId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "recipient_not_found" },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        fromId: userId,
        toId,
        body: messageBody,
        threadId,
      },
      include: {
        from: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        to: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
