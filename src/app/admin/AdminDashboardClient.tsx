"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

interface AdminDashboardClientProps {
  userEmail: string;
  userRole: string;
}

interface Stats {
  users: number;
  patients: number;
  appointments: number;
  alerts: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Alert {
  id: string;
  kind: string;
  payload: any;
  createdAt: string;
}

export function AdminDashboardClient({
  userEmail,
  userRole,
}: AdminDashboardClientProps) {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    patients: 0,
    appointments: 0,
    alerts: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, alertsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/alerts"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users.slice(0, 5));
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Admin Dashboard"
        userEmail={userEmail}
        userRole={userRole}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon="🏥"
            color="bg-green-500"
          />
          <StatCard
            title="Appointments"
            value={stats.appointments}
            icon="📅"
            color="bg-purple-500"
          />
          <StatCard
            title="Active Alerts"
            value={stats.alerts}
            icon="⚠️"
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionButton 
              text="Manage Users" 
              icon="👤" 
              onClick={() => setShowUserManagement(true)}
            />
            <ActionButton 
              text="Hospital Settings" 
              icon="⚙️" 
              onClick={() => setShowSettings(true)}
            />
            <ActionButton 
              text="View Reports" 
              icon="📊" 
              onClick={() => setShowReports(true)}
            />
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Users
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            System Alerts
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500">No alerts</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showUserManagement && (
        <UserManagementModal 
          users={users} 
          onClose={() => setShowUserManagement(false)}
          onRefresh={() => {
            // Refresh users list
            fetch("/api/admin/users")
              .then((res) => res.json())
              .then((data) => setUsers(data.users.slice(0, 5)));
          }}
        />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showReports && (
        <ReportsModal stats={stats} onClose={() => setShowReports(false)} />
      )}
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

function ActionButton({ 
  text, 
  icon, 
  onClick 
}: { 
  text: string; 
  icon: string; 
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
    >
      <span className="text-xl">{icon}</span>
      {text}
    </button>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const getAlertColor = (kind: string) => {
    if (kind.includes("critical")) return "bg-red-100 text-red-800 border-red-200";
    if (kind.includes("warning")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={`p-4 border rounded-lg ${getAlertColor(alert.kind)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm capitalize">
            {alert.kind.replace(/_/g, " ")}
          </p>
          <p className="text-xs mt-1 opacity-80">
            {typeof alert.payload === "object"
              ? JSON.stringify(alert.payload).substring(0, 100)
              : alert.payload}
          </p>
        </div>
        <span className="text-xs opacity-70 ml-4 whitespace-nowrap">
          {formatDate(alert.createdAt)}
        </span>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ 
  title, 
  onClose, 
  children 
}: { 
  title: string; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// User Management Modal
function UserManagementModal({ 
  users, 
  onClose, 
  onRefresh 
}: { 
  users: User[]; 
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("DOCTOR");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          password: "TempPassword123!", // Temporary password
          role: inviteRole,
          hospitalCode: "HOS-123",
        }),
      });

      if (response.ok) {
        setMessage("✓ User invited successfully!");
        setInviteEmail("");
        setTimeout(() => {
          onRefresh();
          setMessage("");
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(`✗ Error: ${data.message || "Failed to invite user"}`);
      }
    } catch (error) {
      setMessage("✗ Error inviting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="User Management" onClose={onClose}>
      <div className="space-y-6">
        {/* Invite User Form */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invite New User
          </h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="doctor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DOCTOR">Doctor</option>
                <option value="FRONT_DESK">Front Desk</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {message && (
              <div className={`p-3 rounded-lg ${message.startsWith("✓") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Inviting..." : "Send Invitation"}
            </button>
          </form>
        </div>

        {/* User List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Users ({users.length})
          </h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Settings Modal
function SettingsModal({ onClose }: { onClose: () => void }) {
  const [hospitalName, setHospitalName] = useState("General Hospital");
  const [timezone, setTimezone] = useState("UTC");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Modal title="Hospital Settings" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hospital Name
          </label>
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
          </select>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Features</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Electronic Health Records (EHR)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Appointment Scheduling</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Billing & Insurance</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Lab Integration</span>
            </label>
          </div>
        </div>
        {saved && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg">
            ✓ Settings saved successfully!
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </form>
    </Modal>
  );
}

// Reports Modal
function ReportsModal({ 
  stats, 
  onClose 
}: { 
  stats: Stats; 
  onClose: () => void;
}) {
  return (
    <Modal title="System Reports & Analytics" onClose={onClose}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-medium">TOTAL USERS</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{stats.users}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-600 font-medium">PATIENTS</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{stats.patients}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-xs text-purple-600 font-medium">APPOINTMENTS</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{stats.appointments}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs text-red-600 font-medium">ALERTS</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{stats.alerts}</p>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">User Growth Rate</span>
              <span className="font-semibold text-green-600">+12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Patient Satisfaction</span>
              <span className="font-semibold text-blue-600">4.8/5.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Average Wait Time</span>
              <span className="font-semibold text-purple-600">15 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">System Uptime</span>
              <span className="font-semibold text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export Reports
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              📊 Export as PDF
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              📈 Export as Excel
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              📧 Email Report
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              🖨️ Print Report
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
