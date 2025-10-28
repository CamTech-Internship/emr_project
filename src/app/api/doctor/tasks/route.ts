import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const createTaskSchema = z.object({
  assigneeId: z.string(),
  title: z.string().min(1),
  dueAt: z.string().optional(),
});

const updateTaskSchema = z.object({
  action: z.enum(["complete", "in_progress"]),
  id: z.string(),
});

/**
 * Get tasks for the user
 * GET /api/doctor/tasks
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        ...(status && { status }),
      },
      include: {
        assignee: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Create or update a task
 * POST /api/doctor/tasks
 */
export async function POST(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const body = await req.json();

    // Check if this is an update action
    if (body.action && body.id) {
      const { action, id } = updateTaskSchema.parse(body);

      const statusMap: Record<string, string> = {
        complete: "done",
        in_progress: "in_progress",
      };

      const task = await prisma.task.update({
        where: { id },
        data: { status: statusMap[action] },
      });

      return NextResponse.json({ success: true, task });
    }

    // Otherwise, create new task
    const { assigneeId, title, dueAt } = createTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        assigneeId,
        title,
        status: "todo",
        ...(dueAt && { dueAt: new Date(dueAt) }),
      },
    });

    return NextResponse.json(
      { success: true, task },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Task operation error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
