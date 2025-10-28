"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

interface FrontDeskDashboardClientProps {
  userEmail: string;
  userRole: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  reason?: string;
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    email: string;
  };
}

interface Patient {
  id: string;
  name: string;
  dob?: string;
  contactInfo?: string;
  createdAt: string;
  _count: {
    appointments: number;
  };
}

export function FrontDeskDashboardClient({
  userEmail,
  userRole,
}: FrontDeskDashboardClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          fetch("/api/front-desk/appointments"),
          fetch("/api/front-desk/patients?limit=10"),
        ]);

        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          // Filter today's appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const todayAppts = data.appointments.filter((apt: Appointment) => {
            const aptDate = new Date(apt.startAt);
            return aptDate >= today && aptDate < tomorrow;
          });
          setAppointments(todayAppts);
        }

        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data.patients);
        }
      } catch (error) {
        console.error("Error fetching front desk data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const checkedInCount = appointments.filter((a) => a.status === "checked_in").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Front Desk Dashboard"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <StatCard
            title="Today's Appointments"
            value={appointments.length}
            icon="📅"
            color="bg-blue-500"
          />
          <StatCard
            title="Checked In"
            value={checkedInCount}
            icon="✓"
            color="bg-green-500"
          />
          <StatCard
            title="Waiting"
            value={scheduledCount}
            icon="⏰"
            color="bg-yellow-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionCard
              title="New Patient"
              description="Register a new patient"
              icon="➕"
              color="bg-green-500"
            />
            <ActionCard
              title="Schedule Appointment"
              description="Book an appointment"
              icon="📅"
              color="bg-blue-500"
            />
            <ActionCard
              title="Check-In"
              description="Patient check-in"
              icon="✅"
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today&apos;s Appointments
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <AppointmentRow key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Patients
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : patients.length === 0 ? (
            <p className="text-gray-600">No patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointments
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {patient._count.appointments}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} rounded-full p-3 text-2xl`}>{icon}</div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <button className="flex items-start gap-4 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left">
      <div className={`${color} rounded-full p-3 text-2xl flex-shrink-0`}>{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </button>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const startTime = new Date(appointment.startAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const statusColor =
    appointment.status === "checked_in"
      ? "bg-green-100 text-green-800"
      : appointment.status === "scheduled"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-900 w-20">{startTime}</div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {appointment.patient.name}
          </p>
          <p className="text-xs text-gray-500">
            Dr. {appointment.doctor.email.split("@")[0]}
          </p>
          {appointment.reason && (
            <p className="text-xs text-gray-500 mt-1">{appointment.reason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {appointment.status.replace("_", " ")}
        </span>
        {appointment.status === "scheduled" && (
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
            Check In
          </button>
        )}
      </div>
    </div>
  );
}
