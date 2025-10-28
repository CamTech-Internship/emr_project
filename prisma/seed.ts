import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create hospital
  const hospital = await prisma.hospital.upsert({
    where: { code: "HOS-123" },
    update: {},
    create: {
      code: "HOS-123",
      name: "General Hospital",
      config: JSON.stringify({ timezone: "UTC", features: ["ehr", "appointments"] }),
    },
  });
  console.log("✅ Hospital created:", hospital.name);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {},
    create: {
      email: "admin@demo.local",
      passwordHash,
      role: "ADMIN",
      hospitalId: hospital.id,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create doctor user
  const doctor = await prisma.user.upsert({
    where: { email: "doctor@demo.local" },
    update: {},
    create: {
      email: "doctor@demo.local",
      passwordHash,
      role: "DOCTOR",
      hospitalId: hospital.id,
    },
  });
  console.log("✅ Doctor user created:", doctor.email);

  // Create front desk user
  const frontDesk = await prisma.user.upsert({
    where: { email: "front@demo.local" },
    update: {},
    create: {
      email: "front@demo.local",
      passwordHash,
      role: "FRONT_DESK",
      hospitalId: hospital.id,
    },
  });
  console.log("✅ Front desk user created:", frontDesk.email);

  // Create patient record
  const patient = await prisma.patient.create({
    data: {
      hospitalId: hospital.id,
      name: "Jane Patient",
      dob: new Date("1990-05-15"),
      contactInfo: JSON.stringify({ phone: "555-0123", email: "jane@example.com" }),
    },
  });
  console.log("✅ Patient created:", patient.name);

  // Create alert
  await prisma.alert.create({
    data: {
      hospitalId: hospital.id,
      kind: "lab_critical",
      payload: JSON.stringify({ test: "K+", value: 6.2, unit: "mEq/L", critical: true }),
    },
  });
  console.log("✅ Critical lab alert created");

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      startAt: new Date(Date.now() + 3600_000), // 1 hour from now
      endAt: new Date(Date.now() + 7200_000),   // 2 hours from now
      reason: "Follow-up consultation",
      status: "scheduled",
    },
  });
  console.log("✅ Appointment created for:", patient.name);

  // Create task
  await prisma.task.create({
    data: {
      assigneeId: doctor.id,
      title: "Review patient lab results",
      status: "todo",
      dueAt: new Date(Date.now() + 86400_000), // 24 hours from now
    },
  });
  console.log("✅ Task created for doctor");

  // Create EHR record
  await prisma.eHRRecord.create({
    data: {
      patientId: patient.id,
      type: "visit_note",
      payload: JSON.stringify({
        chiefComplaint: "Routine checkup",
        vitals: { bp: "120/80", temp: 98.6, pulse: 72 },
        assessment: "Patient in good health",
      }),
    },
  });
  console.log("✅ EHR record created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Demo credentials:");
  console.log("   Admin:      admin@demo.local / Password123!");
  console.log("   Doctor:     doctor@demo.local / Password123!");
  console.log("   Front Desk: front@demo.local / Password123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
