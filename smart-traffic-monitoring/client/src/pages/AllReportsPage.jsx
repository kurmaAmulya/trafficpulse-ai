import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import EvidenceModal from '../components/EvidenceModal';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Camera,
  AlertTriangle,
  X,
  MapPin,
  Calendar,
  User,
  Shield
} from 'lucide-react';

export const AllReportsPage = () => {
  const { user } = useAuth();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [reviewViolation, setReviewViolation] = useState(null);
  const [evidenceModalViolation, setEvidenceModalViolation] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [customFine, setCustomFine] = useState(1000);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/violations', {
        params: {
          search,
          status: statusFilter,
          type: typeFilter
        }
      });
      setViolations(res.data.violations || []);
    } catch (err) {
      console.error('Fetch violations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [search, statusFilter, typeFilter]);

  const handleOpenReview = (violation) => {
    setReviewViolation(violation);
    setReviewNotes(violation.reviewNotes || '');
    setCustomFine(violation.fineAmount || 1000);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!reviewViolation) return;
    try {
      setActionLoading(true);
      await api.patch(`/violations/${reviewViolation._id}/status`, {
        status: newStatus,
        reviewNotes,
        fineAmount: customFine
      });
      setReviewViolation(null);
      fetchViolations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update violation status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Traffic Violations Verification Desk
            </h1>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              Officer Review
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Adjudicate incoming citizen reports, automated CCTV AI hits, and approve fine issuance
          </p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reference ID, plate, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Pending', 'Under Review', 'Verified', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Violations Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading violation records...</div>
      ) : violations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">No reports matching filter criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try switching status filters or search term.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Incident Ref</th>
                  <th className="py-3.5 px-4 font-semibold">Vehicle Plate</th>
                  <th className="py-3.5 px-4 font-semibold">Infraction</th>
                  <th className="py-3.5 px-4 font-semibold">Source</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Fine Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {violations.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      {v.violationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {v.vehicleNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {v.violationType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {v.detectedBy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {v.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      ₹{v.fineAmount || 1000}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(v)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Adjudication Modal */}
      {reviewViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white font-mono">{reviewViolation.violationNumber}</h2>
                    <StatusBadge status={reviewViolation.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Vehicle: <span className="font-mono font-bold text-white">{reviewViolation.vehicleNumber}</span> • Reported by: {reviewViolation.reportedByName || 'Citizen'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewViolation(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evidence Image and Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evidence Photo Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Photo Evidence</span>
                  <button
                    type="button"
                    onClick={() => setEvidenceModalViolation(reviewViolation)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-normal underline"
                  >
                    View Fullscreen
                  </button>
                </span>
                <div
                  onClick={() => setEvidenceModalViolation(reviewViolation)}
                  className="relative h-48 rounded-xl overflow-hidden bg-black border border-slate-800 cursor-pointer group"
                >
                  <img
                    src={reviewViolation.evidenceUrl}
                    alt="Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                    Click to zoom
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Infraction Type:</span>
                  <span className="font-semibold text-rose-300 text-sm">{reviewViolation.violationType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Location:</span>
                  <span className="text-white">{reviewViolation.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Timestamp:</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(reviewViolation.dateTime || reviewViolation.createdAt).toLocaleString()}
                  </span>
                </div>
                {reviewViolation.description && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Reporter Notes:</span>
                    <p className="text-slate-300 italic">"{reviewViolation.description}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adjudication Inputs */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Fine Penalty Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={customFine}
                    onChange={(e) => setCustomFine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Reviewing Officer
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Inspector'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Officer Findings & Review Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Plate clear, license match verified. Issuing Section 184 fine."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('Under Review')}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Mark Under Review</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('Rejected')}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Report</span>
                </button>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('Verified')}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify & Issue E-Challan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Evidence Modal */}
      <EvidenceModal
        isOpen={!!evidenceModalViolation}
        onClose={() => setEvidenceModalViolation(null)}
        violation={evidenceModalViolation}
      />
    </div>
  );
};

export default AllReportsPage;
