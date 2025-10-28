import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const sendMessageSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  body: z.string().min(1),
  threadId: z.string().optional(),
});

/**
 * Get messages for a user
 * GET /api/messages?userId=xxx
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK", "PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || authCheck.claims.sub;
    const threadId = searchParams.get("threadId");

    const where = threadId
      ? { threadId }
      : {
          OR: [
            { toId: userId },
            { fromId: userId },
          ],
        };

    const messages = await prisma.message.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Send a message
 * POST /api/messages
 */
export async function POST(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK", "PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { fromId, toId, body: messageBody, threadId } = sendMessageSchema.parse(body);

    // Verify sender is authenticated user
    if (fromId !== authCheck.claims.sub) {
      return NextResponse.json(
        { error: "forbidden", message: "Cannot send message as another user" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        fromId,
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
      { success: true, message },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
