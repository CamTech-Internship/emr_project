import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["ADMIN"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { hospitalId } = authCheck.claims;

    const [userCount, patientCount, appointmentCount, alertCount] = await Promise.all([
      prisma.user.count({
        where: { hospitalId },
      }),
      prisma.patient.count({
        where: { hospitalId },
      }),
      prisma.appointment.count({
        where: { patient: { hospitalId } },
      }),
      prisma.alert.count({
        where: { hospitalId },
      }),
    ]);

    return NextResponse.json({
      stats: {
        users: userCount,
        patients: patientCount,
        appointments: appointmentCount,
        alerts: alertCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
