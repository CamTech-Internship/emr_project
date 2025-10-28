import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get patients list
 * GET /api/doctor/patients
 * Returns patients for the user's hospital
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { hospitalId } = authCheck.claims;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";

    const where = {
      hospitalId,
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };

    const patients = await prisma.patient.findMany({
      where,
      take: limit,
      orderBy: {
        name: "asc",
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
            ehr: true,
          },
        },
      },
    });

    return NextResponse.json({
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Patients fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
