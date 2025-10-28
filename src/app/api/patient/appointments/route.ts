import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const createAppointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  reason: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  id: z.string(),
  status: z.enum(["scheduled", "cancelled", "completed"]).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * Get appointments
 * GET /api/patient/appointments?patientId=xxx
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK", "PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "missing_patient_id" },
        { status: 400 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
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
            role: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    return NextResponse.json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Create appointment
 * POST /api/patient/appointments
 */
export async function POST(req: NextRequest) {
  const authCheck = requireRole(req, ["DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { patientId, doctorId, startAt, endAt, reason } = createAppointmentSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        reason,
        status: "scheduled",
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
    });

    return NextResponse.json(
      { success: true, appointment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Appointment creation error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Update appointment (cancel, reschedule)
 * PATCH /api/patient/appointments
 */
export async function PATCH(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT", "DOCTOR", "ADMIN", "FRONT_DESK"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { id, status, startAt, endAt, reason } = updateAppointmentSchema.parse(body);

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (startAt) updateData.startAt = new Date(startAt);
    if (endAt) updateData.endAt = new Date(endAt);
    if (reason !== undefined) updateData.reason = reason;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Appointment update error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
