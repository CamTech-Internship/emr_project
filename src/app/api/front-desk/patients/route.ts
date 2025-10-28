import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get patients for front desk
 * GET /api/front-desk/patients
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["FRONT_DESK", "ADMIN"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { hospitalId } = authCheck.claims;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    const patients = await prisma.patient.findMany({
      where: {
        hospitalId,
        ...(search && {
          name: {
            contains: search,
          },
        }),
      },
      select: {
        id: true,
        name: true,
        dob: true,
        contactInfo: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ count: patients.length, patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
