"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

interface DoctorDashboardClientProps {
  userEmail: string;
  userRole: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
  status: string;
  patient: {
    id: string;
    name: string;
    dob?: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueAt?: string;
  createdAt: string;
}

interface Alert {
  id: string;
  kind: string;
  payload: any;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  dob?: string;
  createdAt: string;
  _count: {
    appointments: number;
    ehr: number;
  };
}

export function DoctorDashboardClient({
  userEmail,
  userRole,
}: DoctorDashboardClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, tasksRes, alertsRes, patientsRes] = await Promise.all([
          fetch("/api/doctor/appointments"),
          fetch("/api/doctor/tasks"),
          fetch("/api/doctor/alerts"),
          fetch("/api/doctor/patients?limit=5"),
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

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.tasks.filter((t: Task) => t.status !== "done").slice(0, 5));
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.alerts.slice(0, 3));
        }

        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data.patients);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Doctor Dashboard"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Today's Appointments"
            value={appointments.length}
            icon="📅"
            color="bg-blue-500"
          />
          <StatCard
            title="Pending Tasks"
            value={tasks.length}
            icon="✓"
            color="bg-green-500"
          />
          <StatCard
            title="Active Alerts"
            value={alerts.length}
            icon="⚠️"
            color="bg-red-500"
          />
          <StatCard
            title="My Patients"
            value={patients.length}
            icon="👥"
            color="bg-purple-500"
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Critical Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertBanner key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today&apos;s Schedule
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              My Tasks
            </h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-600">All tasks completed!</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
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
              <div className="space-y-3">
                {patients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}
          </div>
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

function AlertBanner({ alert }: { alert: Alert }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <span className="text-xl mr-3">⚠️</span>
        <div>
          <p className="font-medium text-red-900 capitalize">
            {alert.kind.replace(/_/g, " ")}
          </p>
          <p className="text-sm text-red-700 mt-1">
            {typeof alert.payload === "object"
              ? JSON.stringify(alert.payload)
              : alert.payload}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const startTime = new Date(appointment.startAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(appointment.endAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{appointment.patient.name}</p>
          <p className="text-sm text-gray-600">
            {startTime} - {endTime}
          </p>
          {appointment.reason && (
            <p className="text-xs text-gray-500 mt-1">{appointment.reason}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            appointment.status === "scheduled"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {appointment.status}
        </span>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{task.title}</p>
          {task.dueAt && (
            <p className="text-xs text-gray-500 mt-1">
              Due: {new Date(task.dueAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.status === "todo"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{patient.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {patient._count.appointments} appointments • {patient._count.ehr} records
          </p>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View
        </button>
      </div>
    </div>
  );
}
