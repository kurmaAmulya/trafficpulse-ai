import React from 'react';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const getStyle = () => {
    const s = String(status).toLowerCase();

    // Violation statuses
    if (s === 'verified' || s === 'paid' || s === 'active') {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
    if (s === 'pending') {
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    }
    if (s === 'under review') {
      return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
    }
    if (s === 'rejected' || s === 'suspended' || s === 'stolen') {
      return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    }

    // Role tags
    if (s === 'officer') {
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold';
    }
    if (s === 'admin') {
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold';
    }
    if (s === 'owner') {
      return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold';
    }
    if (s === 'driver') {
      return 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold';
    }
    if (s === 'citizen') {
      return 'bg-slate-500/20 text-slate-300 border border-slate-500/40 font-semibold';
    }

    return 'bg-slate-700/40 text-slate-300 border border-slate-600/30';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};

export default StatusBadge;
