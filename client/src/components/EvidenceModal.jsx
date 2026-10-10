import React from 'react';
import { X, ExternalLink, Calendar, MapPin, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const EvidenceModal = ({ isOpen, onClose, violation }) => {
  if (!isOpen || !violation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-white">{violation.violationNumber}</span>
                <StatusBadge status={violation.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Plate: {violation.vehicleNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evidence Image */}
        <div className="relative bg-black flex items-center justify-center max-h-96 overflow-hidden">
          <img
            src={violation.evidenceUrl}
            alt={`Violation Evidence ${violation.violationNumber}`}
            className="w-full h-auto max-h-96 object-contain"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
            Source: {violation.detectedBy || 'Citizen Camera'}
          </div>
        </div>

        {/* Details Footer */}
        <div className="p-5 space-y-3 bg-slate-900">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block mb-1">Violation Type</span>
              <span className="font-semibold text-rose-300 text-sm">{violation.violationType}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block mb-1">Assessed Fine</span>
              <span className="font-bold text-amber-400 text-sm">₹{violation.fineAmount || 1000}</span>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{violation.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{new Date(violation.dateTime || violation.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {violation.description && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block font-medium mb-1">Description:</span>
              {violation.description}
            </div>
          )}

          {violation.reviewNotes && (
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
              <span className="text-indigo-400 block font-medium mb-0.5">
                Officer Review ({violation.reviewedByOfficer || 'Traffic Officer'}):
              </span>
              {violation.reviewNotes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;
