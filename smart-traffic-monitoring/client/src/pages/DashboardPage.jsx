import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  Car,
  Receipt,
  CheckCircle2,
  Clock,
  Camera,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stats/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.message || 'Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading real-time traffic statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-300">
        <div className="flex items-center space-x-3 mb-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <h3 className="font-semibold text-sm">Dashboard Error</h3>
        </div>
        <p className="text-xs mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const role = user?.role || 'citizen';
  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome & Role Context Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Traffic Operations Dashboard
              </h1>
              <StatusBadge status={role} />
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              {role === 'officer' && 'Real-time review desk for verifying citizen infraction reports, radar alerts, and automated challan generation.'}
              {role === 'admin' && 'Central command metrics, vehicle registry status, automated fine compliance, and database analytics.'}
              {role === 'owner' && 'Authorized view of your registered vehicles, violation audit history, and instant online challan settlement.'}
              {role === 'driver' && 'Operational dashboard for your assigned vehicles, traffic incident records, and safety points.'}
              {role === 'citizen' && 'Civic portal to report traffic infractions with photo evidence and track your verified community impact.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {role === 'citizen' && (
              <Link
                to="/report-violation"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report Violation Now</span>
              </Link>
            )}
            {role === 'officer' && (
              <Link
                to="/all-reports"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Review Pending Reports</span>
              </Link>
            )}
            {role === 'owner' && (
              <Link
                to="/fines"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <Receipt className="w-4 h-4" />
                <span>Pay Challans</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Officer / Admin */}
      {(role === 'officer' || role === 'admin') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pending Reviews</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">{metrics.pendingReviews || 0}</span>
              <span className="text-[11px] text-amber-400 font-medium">Requires Action</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Verified Violations</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">{metrics.verifiedViolations || 0}</span>
              <span className="text-[11px] text-emerald-400 font-medium">Challans Issued</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Registered Vehicles</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">{metrics.totalVehicles || 0}</span>
              <span className="text-[11px] text-slate-400 font-medium">In Registry</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Fines Issued</span>
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">₹{metrics.totalFinesIssued?.toLocaleString() || 0}</span>
              <span className="text-[11px] text-emerald-400 font-medium">₹{metrics.totalFinesCollected?.toLocaleString() || 0} Paid</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid - Owner */}
      {role === 'owner' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">My Vehicles</span>
              <Car className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">{metrics.myVehiclesCount || 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Incidents Logged</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">{metrics.myViolationsCount || 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pending Challans</span>
              <Receipt className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-rose-400 font-mono">{metrics.pendingFinesCount || 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Outstanding Dues</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-400 font-mono">₹{metrics.pendingFinesAmount?.toLocaleString() || 0}</div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid - Citizen */}
      {role === 'citizen' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">My Reports Filed</span>
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">{metrics.totalReported || 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Verified by Police</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-400 font-mono">{metrics.verifiedReports || 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Civic Safety Points</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-400 font-mono">{metrics.civicPoints || 0} pts</div>
          </div>
        </div>
      )}

      {/* Charts & Analytics Visuals (for Officer and Admin) */}
      {(role === 'officer' || role === 'admin') && data?.statusBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Report Status Pipeline</h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data.statusBreakdown.map((item) => {
                const total = metrics.totalViolations || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.name}</span>
                      <span className="text-slate-400 font-mono">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Violation Types Breakdown */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Violations by Infraction Type</h3>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.typeBreakdown && data.typeBreakdown.map((t) => (
                <div key={t.name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">{t.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300">
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Traffic Infractions</h3>
            <p className="text-xs text-slate-400">Latest recorded incidents across monitored corridors</p>
          </div>
          <Link
            to={role === 'citizen' ? '/my-reports' : '/all-reports'}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentViolations && data.recentViolations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Incident ID</th>
                  <th className="pb-3 font-semibold">Vehicle Plate</th>
                  <th className="pb-3 font-semibold">Violation Type</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {data.recentViolations.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 font-mono text-indigo-300">{v.violationNumber}</td>
                    <td className="py-3 font-mono font-bold text-white">{v.vehicleNumber}</td>
                    <td className="py-3">{v.violationType}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{v.location}</td>
                    <td className="py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 font-mono font-semibold text-amber-400">₹{v.fineAmount || 1000}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No violation reports found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
