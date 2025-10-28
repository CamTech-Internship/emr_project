import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  dob: z.string().optional(),
  contactInfo: z.string().optional(),
});

/**
 * Get patient profile
 * GET /api/patient/profile
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;

    // Get user with patient profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: {
          include: {
            _count: {
              select: {
                appointments: true,
                ehr: true,
                prescriptions: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.patientProfile) {
      return NextResponse.json(
        { error: "patient_profile_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: user.patientProfile,
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Update patient profile
 * PATCH /api/patient/profile
 */
export async function PATCH(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;
    const body = await req.json();
    const updates = updateProfileSchema.parse(body);

    // Get user to find patient profile
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

    // Build update data
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.dob) updateData.dob = new Date(updates.dob);
    if (updates.contactInfo) updateData.contactInfo = updates.contactInfo;

    // Update patient profile
    const patient = await prisma.patient.update({
      where: { id: user.patientId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      profile: patient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating patient profile:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
