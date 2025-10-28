import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get doctor's schedule
 * GET /api/doctor/schedule
 * Returns appointments for the next 7 days
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 3600_000);

    const appointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            dob: true,
          },
        },
        doctor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
