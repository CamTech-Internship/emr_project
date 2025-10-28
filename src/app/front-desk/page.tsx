import { requireRole } from "@/lib/auth-server";
import { FrontDeskDashboardClient } from "./FrontDeskDashboardClient";

export default async function FrontDeskDashboard() {
  // Server-side authentication and role check
  const user = await requireRole(["FRONT_DESK"]);

  return <FrontDeskDashboardClient userEmail={user.sub} userRole={user.role} />;
}
