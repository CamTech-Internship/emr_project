import { requireRole } from "@/lib/auth-server";
import { PatientDashboardClient } from "./PatientDashboardClient";

export default async function PatientDashboard() {
  // Server-side authentication and role check
  const user = await requireRole(["PATIENT"]);

  return <PatientDashboardClient userEmail={user.sub} userRole={user.role} />;
}

/*
export default function PatientDashboardOld() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setAppointments([
      {
        id: "1",
        date: "2025-10-28",
        time: "10:00 AM",
        doctor: "Dr. Smith",
        reason: "Follow-up consultation",
        status: "scheduled",
      },
      {
        id: "2",
        date: "2025-10-15",
        time: "2:30 PM",
        doctor: "Dr. Johnson",
        reason: "Annual checkup",
        status: "completed",
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Portal
            </h1>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, Jane Patient!</h2>
          <p className="text-blue-100">
            Here&apos;s your health information and upcoming appointments.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Next Appointment" value="Oct 28, 2025" icon="📅" />
          <StatCard title="Total Visits" value="12" icon="🏥" />
          <StatCard title="Active Prescriptions" value="2" icon="💊" />
        </div>

        {/* My Appointments */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              My Appointments
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Request Appointment
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">
                          {apt.doctor}
                        </p>
                        <StatusBadge status={apt.status} />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {apt.reason}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ActionCard
            title="Medical Records"
            description="View your health records and test results"
            icon="📋"
          />
          <ActionCard
            title="Messages"
            description="Communicate with your healthcare team"
            icon="💬"
          />
          <ActionCard
            title="Prescriptions"
            description="View and manage your prescriptions"
            icon="💊"
          />
          <ActionCard
            title="Billing"
            description="View bills and payment history"
            icon="💳"
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status] || colors.scheduled
      }`}
    >
      {status}
    </span>
  );
}

function ActionCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <button className="flex items-start gap-4 p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left">
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  );
}
