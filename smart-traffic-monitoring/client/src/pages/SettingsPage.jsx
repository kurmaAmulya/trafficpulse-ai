import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Database,
  Shield,
  Users,
  Server,
  Key,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, dbStatus, demoUsers, quickSwitchRole, refreshSystemInfo } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSystemInfo();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            System & Architecture Settings
          </h1>
          <p className="text-xs text-slate-400">
            Hackathon infrastructure status, database cluster telemetry, and demo role accounts
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database & Runtime Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Database & Persistence Layer</h3>
              <p className="text-xs text-slate-400">Current active data store driver</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connection Mode:</span>
              <span className="font-mono font-bold text-emerald-400">
                {dbStatus.mode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Driver Status:</span>
              <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
                <span>ONLINE & OPERATIONAL</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mongoose ODM:</span>
              <span className="font-mono text-slate-300">v8.9.5 (Active)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Resilient Fallback:</span>
              <span className="text-slate-300">Auto-failover to in-memory store</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300">
            <span className="font-semibold block mb-0.5">Hackathon Resilience Guarantee:</span>
            If the local MongoDB service is restarted or stopped, the application immediately serves from memory without dropping requests.
          </div>
        </div>

        {/* Current Session & Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Session Token</h3>
              <p className="text-xs text-slate-400">Role-Based Access Control (RBAC)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Signed In As:</span>
              <span className="font-semibold text-white">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email Address:</span>
              <span className="font-mono text-slate-300">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">System Role:</span>
              <span className="uppercase font-mono font-bold text-indigo-400">{user?.role}</span>
            </div>
            {user?.badgeNumber && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Badge ID:</span>
                <span className="font-mono text-slate-300">{user?.badgeNumber}</span>
              </div>
            )}
            {user?.assignedVehicle && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Vehicle:</span>
                <span className="font-mono text-cyan-300">{user?.assignedVehicle}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Users Switcher Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pre-Configured Demo Accounts</h3>
            <p className="text-xs text-slate-400">Click any role to test specific perspectives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              role: 'officer',
              title: 'Traffic Officer',
              email: 'officer@traffic.gov',
              desc: 'Adjudicate citizen photos, review infractions, issue challans'
            },
            {
              role: 'citizen',
              title: 'Citizen Reporter',
              email: 'citizen@citizen.in',
              desc: 'Report traffic violations, upload photos, track report status'
            },
            {
              role: 'owner',
              title: 'Vehicle Owner',
              email: 'owner@citizen.in',
              desc: 'Owns DL-01-AB-1234 & HR-26-EQ-9012, view and pay challans'
            },
            {
              role: 'driver',
              title: 'Driver',
              email: 'driver@citizen.in',
              desc: 'Assigned to DL-01-AB-1234, view driving history & points'
            },
            {
              role: 'admin',
              title: 'HQ Administrator',
              email: 'admin@traffic.gov',
              desc: 'Complete system oversight, vehicle registry, full analytics'
            }
          ].map((acc) => {
            const isCurrent = user?.role === acc.role;
            return (
              <div
                key={acc.role}
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{acc.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-indigo-400 mt-1">{acc.email}</div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{acc.desc}</p>
                </div>

                <button
                  onClick={() => quickSwitchRole(acc.role)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isCurrent ? 'Current Session' : `Switch to ${acc.title}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* REST API Endpoints Reference Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
        <h3 className="font-bold text-white flex items-center space-x-2">
          <Code className="w-4 h-4 text-slate-400" />
          <span>Active REST API Endpoints</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-emerald-400 font-bold">GET</span> /api/vehicles - List & search registry
          </div>
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-indigo-400 font-bold">POST</span> /api/violations - Submit violation with upload
          </div>
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-amber-400 font-bold">PATCH</span> /api/violations/:id/status - Review & verify
          </div>
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-emerald-400 font-bold">POST</span> /api/fines/:id/pay - Instant settlement
          </div>
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-indigo-400 font-bold">POST</span> /api/cameras/trigger-detection - AI trigger
          </div>
          <div className="p-2 rounded bg-slate-950 text-slate-300">
            <span className="text-emerald-400 font-bold">GET</span> /api/health - Telemetry & DB state
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
