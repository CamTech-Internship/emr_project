"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

interface PatientDashboardClientProps {
  userEmail: string;
  userRole: string;
}

interface PatientProfile {
  id: string;
  name: string;
  dob?: string;
  contactInfo?: string;
  _count: {
    appointments: number;
    ehr: number;
    prescriptions: number;
  };
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
  status: string;
  doctor: {
    id: string;
    email: string;
  };
}

interface Prescription {
  id: string;
  payload: any;
  createdAt: string;
  doctor: {
    email: string;
  };
}

interface EHRRecord {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
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

type ViewMode = "overview" | "profile" | "appointments" | "messages" | "prescriptions" | "ehr";

export function PatientDashboardClient({
  userEmail,
  userRole,
}: PatientDashboardClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch("/api/patient/profile");
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);

        // Fetch other data using profile ID
        if (data.profile?.id) {
          const [appointmentsRes, prescriptionsRes, ehrRes, messagesRes] = await Promise.all([
            fetch(`/api/patient/appointments?patientId=${data.profile.id}`),
            fetch("/api/patient/prescriptions"),
            fetch("/api/patient/ehr"),
            fetch("/api/patient/messages"),
          ]);

          if (appointmentsRes.ok) {
            const aptData = await appointmentsRes.json();
            setAppointments(aptData.appointments || []);
          }

          if (prescriptionsRes.ok) {
            const rxData = await prescriptionsRes.json();
            setPrescriptions(rxData.prescriptions || []);
          }

          if (ehrRes.ok) {
            const ehrData = await ehrRes.json();
            setEhrRecords(ehrData.records || []);
          }

          if (messagesRes.ok) {
            const msgData = await messagesRes.json();
            setMessages(msgData.messages || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch("/api/patient/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status: "cancelled" }),
      });

      if (res.ok) {
        await fetchData();
        alert("Appointment cancelled successfully");
      } else {
        alert("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Error cancelling appointment");
    }
  };

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.startAt) > new Date() && apt.status === "scheduled")
    .slice(0, 3);

  const recentMessages = messages
    .filter((msg) => !msg.seenAt)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Patient Portal"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex space-x-1 p-2">
            {[
              { id: "overview", label: "Overview", icon: "🏠" },
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "appointments", label: "Appointments", icon: "📅" },
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "prescriptions", label: "Prescriptions", icon: "💊" },
              { id: "ehr", label: "Medical History", icon: "📋" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as ViewMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            {viewMode === "overview" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {profile?.name || "Patient"}!
                  </h2>
                  <p className="text-blue-100">
                    Here&apos;s your health information and upcoming appointments.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard
                    title="Upcoming Appointments"
                    value={upcomingAppointments.length}
                    icon="📅"
                  />
                  <StatCard
                    title="Active Prescriptions"
                    value={prescriptions.length}
                    icon="💊"
                  />
                  <StatCard
                    title="Unread Messages"
                    value={recentMessages.length}
                    icon="💬"
                  />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ActionCard
                    title="Book Appointment"
                    description="Schedule a visit with your doctor"
                    icon="📅"
                    onClick={() => setShowBookingModal(true)}
                  />
                  <ActionCard
                    title="Send Message"
                    description="Contact your healthcare provider"
                    icon="💬"
                    onClick={() => setShowMessageModal(true)}
                  />
                  <ActionCard
                    title="View Prescriptions"
                    description="Check your current medications"
                    icon="💊"
                    onClick={() => setViewMode("prescriptions")}
                  />
                  <ActionCard
                    title="Medical History"
                    description="Access your health records"
                    icon="📋"
                    onClick={() => setViewMode("ehr")}
                  />
                </div>

                {/* Recent Activity */}
                {upcomingAppointments.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Upcoming Appointments
                    </h3>
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          onCancel={cancelAppointment}
                          onView={() => setSelectedAppointment(apt)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile View */}
            {viewMode === "profile" && profile && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <ProfileField label="Name" value={profile.name} />
                  <ProfileField
                    label="Date of Birth"
                    value={profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}
                  />
                  <ProfileField label="Contact Info" value={profile.contactInfo || "Not set"} />
                  <ProfileField label="Email" value={userEmail} />
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-gray-700 mb-2">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {profile._count.appointments}
                        </p>
                        <p className="text-sm text-gray-600">Appointments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {profile._count.prescriptions}
                        </p>
                        <p className="text-sm text-gray-600">Prescriptions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {profile._count.ehr}
                        </p>
                        <p className="text-sm text-gray-600">Records</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments View */}
            {viewMode === "appointments" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">My Appointments</h2>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <p className="text-gray-600">No appointments found.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onCancel={cancelAppointment}
                        onView={() => setSelectedAppointment(apt)}
                        showDetails
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages View */}
            {viewMode === "messages" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Messages</h2>
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    New Message
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-gray-600">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <MessageCard key={msg.id} message={msg} currentUserEmail={userEmail} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Prescriptions View */}
            {viewMode === "prescriptions" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Prescriptions</h2>

                {prescriptions.length === 0 ? (
                  <p className="text-gray-600">No prescriptions found.</p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((rx) => (
                      <PrescriptionCard key={rx.id} prescription={rx} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EHR/Medical History View */}
            {viewMode === "ehr" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Medical History</h2>

                {ehrRecords.length === 0 ? (
                  <p className="text-gray-600">No medical records found.</p>
                ) : (
                  <div className="space-y-3">
                    {ehrRecords.map((record) => (
                      <EHRCard key={record.id} record={record} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {showBookingModal && (
          <SimpleModal
            title="Book Appointment"
            onClose={() => setShowBookingModal(false)}
          >
            <p className="text-gray-600">
              Appointment booking functionality will be implemented here.
              Please contact front desk to book an appointment.
            </p>
          </SimpleModal>
        )}

        {showMessageModal && (
          <SimpleModal
            title="Send Message"
            onClose={() => setShowMessageModal(false)}
          >
            <p className="text-gray-600">
              Message sending functionality will be implemented here.
              Please contact your doctor directly.
            </p>
          </SimpleModal>
        )}

        {showProfileModal && (
          <SimpleModal
            title="Edit Profile"
            onClose={() => setShowProfileModal(false)}
          >
            <p className="text-gray-600">
              Profile editing functionality will be implemented here.
              Please contact admin to update your profile.
            </p>
          </SimpleModal>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  );
}

// Profile Field Component
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({
  appointment,
  onCancel,
  onView,
  showDetails = false,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onView: () => void;
  showDetails?: boolean;
}) {
  const startTime = new Date(appointment.startAt).toLocaleString();
  const isFuture = new Date(appointment.startAt) > new Date();

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-gray-900">{appointment.doctor.email}</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                appointment.status === "scheduled"
                  ? "bg-blue-100 text-blue-800"
                  : appointment.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {appointment.status}
            </span>
          </div>
          {appointment.reason && (
            <p className="text-sm text-gray-600 mb-1">{appointment.reason}</p>
          )}
          <p className="text-sm text-gray-500">{startTime}</p>
        </div>
        <div className="flex gap-2">
          {showDetails && (
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View
            </button>
          )}
          {isFuture && appointment.status === "scheduled" && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Card Component
function MessageCard({
  message,
  currentUserEmail,
}: {
  message: Message;
  currentUserEmail: string;
}) {
  const isSent = message.from.email === currentUserEmail;

  return (
    <div className={`border rounded-lg p-4 ${!message.seenAt && !isSent ? "bg-blue-50" : ""}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">
            {isSent ? `To: ${message.to.email}` : `From: ${message.from.email}`}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>
        {!message.seenAt && !isSent && (
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
            New
          </span>
        )}
      </div>
      <p className="text-gray-700">{message.body}</p>
    </div>
  );
}

// Prescription Card Component
function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const payload = prescription.payload;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900">
            {payload.medication || "Prescription"}
          </p>
          <p className="text-sm text-gray-600">
            Prescribed by: {prescription.doctor.email}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(prescription.createdAt).toLocaleDateString()}
        </span>
      </div>
      {payload.dosage && <p className="text-sm text-gray-700">Dosage: {payload.dosage}</p>}
      {payload.instructions && (
        <p className="text-sm text-gray-600 mt-1">{payload.instructions}</p>
      )}
    </div>
  );
}

// EHR Card Component
function EHRCard({ record }: { record: EHRRecord }) {
  const payload = record.payload;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900 capitalize">
            {record.type.replace(/_/g, " ")}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-sm text-gray-700">
        {typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)}
      </div>
    </div>
  );
}

// Simple Modal Component
function SimpleModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
