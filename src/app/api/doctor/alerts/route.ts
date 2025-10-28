import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get hospital alerts
 * GET /api/doctor/alerts
 * Returns recent alerts for the user's hospital
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { hospitalId } = authCheck.claims;

    const alerts = await prisma.alert.findMany({
      where: {
        hospitalId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Parse JSON payload strings
    const parsedAlerts = alerts.map((alert: any) => ({
      ...alert,
      payload: JSON.parse(alert.payload),
    }));

    return NextResponse.json({
      count: parsedAlerts.length,
      alerts: parsedAlerts,
    });
  } catch (error) {
    console.error("Alerts fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
