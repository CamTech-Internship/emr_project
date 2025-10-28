import { requireRole } from "@/lib/auth-server";
import { DoctorDashboardClient } from "./DoctorDashboardClient";

export default async function DoctorDashboard() {
  // Server-side authentication and role check
  const user = await requireRole(["DOCTOR"]);

  return <DoctorDashboardClient userEmail={user.sub} userRole={user.role} />;
}
