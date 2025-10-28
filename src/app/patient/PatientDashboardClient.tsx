"use client";

import DashboardHeader from "@/components/DashboardHeader";

interface PatientDashboardClientProps {
  userEmail: string;
  userRole: string;
}

export function PatientDashboardClient({
  userEmail,
  userRole,
}: PatientDashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Patient Portal"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Appointments</h2>
          <p className="text-gray-600">No upcoming appointments.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Records</h2>
          <p className="text-gray-600">Your medical records will appear here.</p>
        </div>
      </main>
    </div>
  );
}
