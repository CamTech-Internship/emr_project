import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get all appointments for front desk
 * GET /api/front-desk/appointments
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["FRONT_DESK", "ADMIN"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { hospitalId } = authCheck.claims;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const appointments = await prisma.appointment.findMany({
      where: {
        patient: {
          hospitalId,
        },
        ...(status && { status }),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
      take: 50,
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
