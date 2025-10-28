import { requireRole } from "@/lib/auth-server";
import { PatientDashboardClient } from "./PatientDashboardClient";

export default async function PatientDashboard() {
  // Server-side authentication and role check
  const user = await requireRole(["PATIENT"]);

  return <PatientDashboardClient userEmail={user.sub} userRole={user.role} />;
}

