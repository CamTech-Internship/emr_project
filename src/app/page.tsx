import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser();
  
  if (user) {
    // Redirect authenticated users to their dashboard
    const roleRoutes: Record<string, string> = {
      ADMIN: "/admin",
      DOCTOR: "/doctor",
      FRONT_DESK: "/front-desk",
      PATIENT: "/patient",
    };
    redirect(roleRoutes[user.role] || "/login");
  }
  
  // Redirect unauthenticated users to login
  redirect("/login");
}
