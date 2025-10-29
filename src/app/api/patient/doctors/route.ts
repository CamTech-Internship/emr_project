import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

/**
 * Get list of doctors that patient can message
 * GET /api/patient/doctors
 */
export async function GET(req: NextRequest) {
  const authCheck = requireRole(req, ["PATIENT"]);
  if (!authCheck.ok) {
    return NextResponse.json(authCheck.body, { status: authCheck.status });
  }

  try {
    const { sub: userId } = authCheck.claims;

    // Get patient's profile to find doctors they've had appointments with
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

    // Get unique doctors from patient's appointments
    const appointments = await prisma.appointment.findMany({
      where: { patientId: user.patientId },
      select: {
        doctor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      distinct: ["doctorId"],
    });

    const doctorsFromAppointments = appointments.map((apt) => apt.doctor);

    // Also get all doctors as an option (for new patients or general inquiries)
    const allDoctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        email: true,
      },
    });

    // Combine and deduplicate
    const doctorMap = new Map();
    [...doctorsFromAppointments, ...allDoctors].forEach((doc) => {
      if (!doctorMap.has(doc.id)) {
        doctorMap.set(doc.id, doc);
      }
    });

    const doctors = Array.from(doctorMap.values());

    return NextResponse.json({
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
