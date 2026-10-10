import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  AlertTriangle,
  FileCheck2,
  FileText,
  Receipt,
  Camera,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  // Role-conditioned navigation links
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['citizen', 'owner', 'driver', 'officer', 'admin']
    },
    {
      to: '/camera-monitoring',
      label: 'Camera Monitoring',
      icon: Camera,
      badge: 'CCTV DEMO',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      roles: ['officer', 'admin']
    },
    {
      to: '/all-reports',
      label: 'All Reports & Review',
      icon: FileCheck2,
      badge: 'Officer HQ',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      roles: ['officer', 'admin']
    },
    {
      to: '/report-violation',
      label: 'Report Violation',
      icon: AlertTriangle,
      badge: 'Public Action',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      roles: ['citizen', 'owner', 'officer', 'admin']
    },
    {
      to: '/my-reports',
      label: 'My Reports',
      icon: FileText,
      roles: ['citizen']
    },
    {
      to: '/vehicles',
      label: role === 'owner' ? 'My Vehicles' : role === 'driver' ? 'Assigned Vehicle' : 'Vehicle Registry',
      icon: Car,
      roles: ['citizen', 'owner', 'driver', 'officer', 'admin']
    },
    {
      to: '/fines',
      label: role === 'owner' || role === 'driver' ? 'Payable Fines / Challans' : 'Challan Registry',
      icon: Receipt,
      roles: ['citizen', 'owner', 'driver', 'officer', 'admin']
    },
    {
      to: '/settings',
      label: 'System & DB Config',
      icon: Settings,
      roles: ['citizen', 'owner', 'driver', 'officer', 'admin']
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Context Card */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            {role === 'officer' || role === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            ) : (
              <UserCheck className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name}</h4>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                {role}
              </span>
              {user?.badgeNumber && (
                <span className="text-[10px] text-slate-400 font-mono">
                  #{user.badgeNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Navigation
          </div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/70 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold tracking-wider ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom helper card */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="text-slate-300 font-medium flex items-center justify-between">
          <span>Active Session</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radar-live" />
        </div>
        <p className="text-slate-500 text-[10px]">
          Hackathon Edition v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
