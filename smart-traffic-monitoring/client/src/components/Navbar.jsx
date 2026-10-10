import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Database, Users, ChevronDown, Sparkles, LogOut, User } from 'lucide-react';
import DemoWalkthroughModal from './DemoWalkthroughModal';

export const Navbar = () => {
  const { user, dbStatus, quickSwitchRole, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const roles = [
    { id: 'officer', name: 'Traffic Officer', desc: 'Verify reports, CCTV AI' },
    { id: 'citizen', name: 'Citizen Reporter', desc: 'Submit violation photos' },
    { id: 'owner', name: 'Vehicle Owner', desc: 'My cars & pay fines' },
    { id: 'driver', name: 'Driver', desc: 'Assigned vehicle history' },
    { id: 'admin', name: 'System Admin', desc: 'Full control & analytics' },
  ];

  const currentRoleObj = roles.find(r => r.id === user?.role) || roles[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  TRAFFIC<span className="text-cyan-400">PULSE</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  MERN AI
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400">
                Autonomous Traffic Monitoring & Violation Management
              </p>
            </div>
          </div>

          {/* Center: Live DB indicator & Hackathon Script */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* DB Health Pill */}
            <div
              className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                dbStatus.connected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
              }`}
              title={dbStatus.mode}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-current radar-live" />
              <span className="truncate max-w-[140px] md:max-w-none">
                {dbStatus.connected ? 'MongoDB Active' : 'Demo Memory'}
              </span>
            </div>

            {/* Hackathon Demo Guide Trigger */}
            <button
              onClick={() => setGuideModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Judge Demo Guide</span>
              <span className="xs:hidden">Demo</span>
            </button>
          </div>

          {/* Right: Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold leading-tight text-white flex items-center space-x-1">
                  <span>{currentRoleObj.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.email}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Switch Role (1-Click Demo)</span>
                  <Users className="w-3.5 h-3.5" />
                </div>

                <div className="p-1 space-y-0.5">
                  {roles.map((r) => {
                    const isSelected = user?.role === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={async () => {
                          setRoleDropdownOpen(false);
                          await quickSwitchRole(r.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white">{r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.desc}</div>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800 px-1">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Demo Workflow Guide Modal */}
      <DemoWalkthroughModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onSwitchRole={quickSwitchRole}
      />
    </>
  );
};

export default Navbar;
