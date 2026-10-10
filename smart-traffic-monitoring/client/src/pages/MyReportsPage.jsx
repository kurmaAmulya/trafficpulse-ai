import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import EvidenceModal from '../components/EvidenceModal';
import {
  FileText,
  AlertTriangle,
  Eye,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evidenceModalViolation, setEvidenceModalViolation] = useState(null);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/violations', {
        params: { myReports: 'true' }
      });
      setReports(res.data.violations || []);
    } catch (err) {
      console.error('Fetch my reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [user?.role]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            My Submitted Violation Reports
          </h1>
          <p className="text-xs text-slate-400">
            Track real-time adjudication status and verification of reports you have filed
          </p>
        </div>

        <Link
          to="/report-violation"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Violation</span>
        </Link>
      </div>

      {/* Citizen Reward Pill */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Community Road Safety Contributor</h3>
            <p className="text-[11px] text-slate-300">
              Each verified report awards 50 Civic Safety Points and helps authorities maintain safer roadways.
            </p>
          </div>
        </div>
        <div className="text-right font-mono">
          <span className="text-sm font-bold text-amber-400">
            {reports.filter(r => r.status === 'Verified').length * 50} pts
          </span>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading your reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">You haven't reported any violations yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Spot a traffic violation? Snap a photo and submit it to earn safety points.
          </p>
          <Link
            to="/report-violation"
            className="inline-flex items-center space-x-2 px-4 py-2 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Report First Incident</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {r.violationNumber}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-0.5">
                      {r.vehicleNumber}
                    </h3>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="font-semibold text-rose-300">{r.violationType}</div>
                  <div className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                  <div className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{new Date(r.dateTime || r.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {r.reviewNotes && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                    <span className="text-indigo-400 font-medium block">
                      Officer Remark ({r.reviewedByOfficer || 'Traffic Police'}):
                    </span>
                    {r.reviewNotes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Fine Amount: ₹{r.fineAmount || 1000}
                </span>
                <button
                  onClick={() => setEvidenceModalViolation(r)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence preview modal */}
      <EvidenceModal
        isOpen={!!evidenceModalViolation}
        onClose={() => setEvidenceModalViolation(null)}
        violation={evidenceModalViolation}
      />
    </div>
  );
};

export default MyReportsPage;
