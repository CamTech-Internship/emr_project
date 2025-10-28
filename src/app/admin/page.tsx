import { requireRole } from "@/lib/auth-server";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboard() {
  // Server-side authentication and role check
  const user = await requireRole(["ADMIN"]);

  return <AdminDashboardClient userEmail={user.sub} userRole={user.role} />;
}
