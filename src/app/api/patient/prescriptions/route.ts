import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get patient's prescriptions
 * GET /api/patient/prescriptions
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
      // Doctor can view any patient's prescriptions
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

    // Fetch prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON payloads
    const prescriptionData = prescriptions.map((rx) => ({
      ...rx,
      payload: JSON.parse(rx.payload),
    }));

    return NextResponse.json({
      count: prescriptionData.length,
      prescriptions: prescriptionData,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
