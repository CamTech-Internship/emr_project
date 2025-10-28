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
            <ActionButton text="Manage Users" icon="👤" />
            <ActionButton text="Hospital Settings" icon="⚙️" />
            <ActionButton text="View Reports" icon="📊" />
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

function ActionButton({ text, icon }: { text: string; icon: string }) {
  return (
    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
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
