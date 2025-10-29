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

interface Message {
  id: string;
  body: string;
  createdAt: string;
  seenAt?: string;
  from: {
    id: string;
    email: string;
    role: string;
  };
  to: {
    id: string;
    email: string;
    role: string;
  };
}

type ViewMode = "overview" | "messages";

export function DoctorDashboardClient({
  userEmail,
  userRole,
}: DoctorDashboardClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Message modal state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, tasksRes, alertsRes, patientsRes, messagesRes] = await Promise.all([
        fetch("/api/doctor/appointments"),
        fetch("/api/doctor/tasks"),
        fetch("/api/doctor/alerts"),
        fetch("/api/doctor/patients?limit=5"),
        fetch("/api/patient/messages"),
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

        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setShowReplyModal(true);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyToMessage || !replyBody.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setSendingReply(true);
      const res = await fetch("/api/patient/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toId: replyToMessage.from.id,
          body: replyBody,
        }),
      });

      if (res.ok) {
        alert("Reply sent successfully!");
        setReplyBody("");
        setReplyToMessage(null);
        setShowReplyModal(false);
        await fetchData();
      } else {
        const error = await res.json();
        alert(`Failed to send reply: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  const unreadMessages = messages.filter((msg) => !msg.seenAt && msg.to.email === userEmail);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Doctor Dashboard"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex space-x-1 p-2">
            {[
              { id: "overview", label: "Overview", icon: "🏠" },
              { id: "messages", label: "Messages", icon: "💬", badge: unreadMessages.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as ViewMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  viewMode === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview */}
        {viewMode === "overview" && (
          <>
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
          </>
        )}

        {/* Messages View */}
        {viewMode === "messages" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Messages
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-600">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <DoctorMessageCard
                    key={msg.id}
                    message={msg}
                    currentUserEmail={userEmail}
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && replyToMessage && (
          <ReplyModal
            message={replyToMessage}
            replyBody={replyBody}
            sending={sendingReply}
            onReplyChange={setReplyBody}
            onSubmit={sendReply}
            onClose={() => {
              setShowReplyModal(false);
              setReplyToMessage(null);
              setReplyBody("");
            }}
          />
        )}
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

// Doctor Message Card Component
function DoctorMessageCard({
  message,
  currentUserEmail,
  onReply,
}: {
  message: Message;
  currentUserEmail: string;
  onReply: (message: Message) => void;
}) {
  const isSent = message.from.email === currentUserEmail;
  const isUnread = !message.seenAt && !isSent;

  return (
    <div className={`border rounded-lg p-4 ${isUnread ? "bg-blue-50 border-blue-200" : ""}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {isSent ? `To: ${message.to.email}` : `From: ${message.from.email}`}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isUnread && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              New
            </span>
          )}
          {!isSent && (
            <button
              onClick={() => onReply(message)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-700 mt-2">{message.body}</p>
    </div>
  );
}

// Reply Modal Component
function ReplyModal({
  message,
  replyBody,
  sending,
  onReplyChange,
  onSubmit,
  onClose,
}: {
  message: Message;
  replyBody: string;
  sending: boolean;
  onReplyChange: (body: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Reply to Message</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={sending}
          >
            ✕
          </button>
        </div>

        {/* Original Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>From:</strong> {message.from.email}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Sent:</strong> {new Date(message.createdAt).toLocaleString()}
          </p>
          <div className="pt-2 border-t border-gray-300">
            <p className="text-gray-700">{message.body}</p>
          </div>
        </div>

        {/* Reply Form */}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply:
            </label>
            <textarea
              id="reply"
              value={replyBody}
              onChange={(e) => onReplyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
              rows={6}
              placeholder="Type your reply here..."
              disabled={sending}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
