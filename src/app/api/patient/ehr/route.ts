import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get patient's EHR/medical history
 * GET /api/patient/ehr
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT", "DOCTOR"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId, role } = authCheck.claims;
    const { searchParams } = new URL(req.url);

    let patientId: string | null = null;

    if (role === "PATIENT") {
      // Get patient ID from user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { patientId: true },
      });

      if (!user || !user.patientId) {
        return NextResponse.json(
          { error: "patient_profile_not_found" },
          { status: 404 }
        );
      }

      patientId = user.patientId;
    } else if (role === "DOCTOR") {
      // Doctor can view any patient's EHR
      patientId = searchParams.get("patientId");
      if (!patientId) {
        return NextResponse.json(
          { error: "missing_patient_id" },
          { status: 400 }
        );
      }
    }

    if (!patientId) {
      return NextResponse.json(
        { error: "patient_not_found" },
        { status: 404 }
      );
    }

    // Fetch EHR records
    const ehrRecords = await prisma.eHRRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON payloads
    const records = ehrRecords.map((record) => ({
      ...record,
      payload: JSON.parse(record.payload),
    }));

    return NextResponse.json({
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching EHR records:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
