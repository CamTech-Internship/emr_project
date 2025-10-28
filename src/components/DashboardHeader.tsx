"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  userEmail?: string;
  userRole?: string;
}

export default function DashboardHeader({
  title,
  userEmail,
  userRole,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {userEmail && (
              <p className="text-sm text-gray-600 mt-1">
                Logged in as: <span className="font-medium">{userEmail}</span>
                {userRole && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {userRole}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
