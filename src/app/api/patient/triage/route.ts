import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const triageSchema = z.object({
  patientId: z.string(),
  details: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

/**
 * Submit triage request
 * POST /api/patient/triage
 */
export async function POST(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK", "PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { patientId, details, severity } = triageSchema.parse(body);

    // Get patient to get hospital ID
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { hospitalId: true, name: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "patient_not_found" },
        { status: 404 }
      );
    }

    // Create alert for triage request
    const alert = await prisma.alert.create({
      data: {
        hospitalId: patient.hospitalId,
        kind: "triage_request",
        payload: JSON.stringify({
          patientId,
          patientName: patient.name,
          details,
          severity,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Triage request submitted",
        alertId: alert.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Triage submission error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
