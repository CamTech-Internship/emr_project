import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get recent alerts (Admin only)
 * GET /api/admin/alerts
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["ADMIN"]);
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
      take: 20,
    });

    // Parse JSON payload strings
    const parsedAlerts = alerts.map((alert: any) => ({
      ...alert,
      payload: JSON.parse(alert.payload),
    }));

    return NextResponse.json({ count: parsedAlerts.length, alerts: parsedAlerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
