import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get doctor's appointments
 * GET /api/doctor/appointments
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            dob: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json({ count: appointments.length, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
