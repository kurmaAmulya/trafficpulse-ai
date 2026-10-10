import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import {
  Receipt,
  Search,
  Filter,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  QrCode,
  Smartphone,
  ShieldCheck,
  Calendar,
  FileCheck
} from 'lucide-react';

export const FinesPage = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Payment Modal
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState(null);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fines', {
        params: {
          search,
          status: statusFilter
        }
      });
      setFines(res.data.fines || []);
    } catch (err) {
      console.error('Fetch fines error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [search, statusFilter, user?.role]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    try {
      setPaying(true);
      const res = await api.post(`/fines/${selectedFine._id}/pay`, {
        paymentMethod
      });
      setPaidReceipt(res.data.fine);
      fetchFines();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  const role = user?.role || 'citizen';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Traffic E-Challan & Fine Registry
          </h1>
          <p className="text-xs text-slate-400">
            Official motorized traffic violation penalties, status tracking, and digital clearance
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Challan No., Plate, or Infraction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5">
          {['All', 'Pending', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading fine records...</div>
      ) : fines.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-slate-300">No dues or fines found</p>
          <p className="text-xs text-slate-500 mt-1">All traffic citations are settled or no records exist.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Challan Ref</th>
                  <th className="py-3.5 px-4 font-semibold">Vehicle Plate</th>
                  <th className="py-3.5 px-4 font-semibold">Infraction</th>
                  <th className="py-3.5 px-4 font-semibold">Registered Owner</th>
                  <th className="py-3.5 px-4 font-semibold">Penalty (₹)</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Settlement / Due</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      {f.fineNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {f.vehicleNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {f.violationType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {f.ownerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                      ₹{f.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {f.status === 'Paid' ? (
                        <span className="text-emerald-400">
                          Paid: {new Date(f.paymentDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Due: {new Date(f.dueDate).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {f.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            setSelectedFine(f);
                            setPaidReceipt(null);
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedFine(f);
                            setPaidReceipt(f);
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Online Settlement / Receipt Modal */}
      {selectedFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {paidReceipt ? 'Official Payment Receipt' : 'Instant E-Challan Settlement'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedFine(null);
                  setPaidReceipt(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paidReceipt ? (
              /* Receipt View */
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SUCCESSFUL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Challan Ref:</span>
                    <span className="font-mono font-bold text-white">{paidReceipt.fineNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle Plate:</span>
                    <span className="font-mono font-bold text-indigo-400">{paidReceipt.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Infraction:</span>
                    <span className="text-white">{paidReceipt.violationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹{paidReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-[10px] text-slate-300">{paidReceipt.transactionRef || 'TXN-99281729'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method:</span>
                    <span>{paidReceipt.paymentMethod || 'UPI Instant Gateway'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(paidReceipt.paymentDate || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  This transaction clears all pending police enforcement flags against this ticket.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFine(null);
                    setPaidReceipt(null);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Payment Form */
              <form onSubmit={handlePay} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Challan No:</span>
                    <span className="text-white font-bold">{selectedFine.fineNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plate:</span>
                    <span className="text-indigo-400 font-bold">{selectedFine.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Infraction:</span>
                    <span className="text-white">{selectedFine.violationType}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                    <span className="text-slate-300 font-sans font-semibold">Total Payable:</span>
                    <span className="text-amber-400 font-bold">₹{selectedFine.amount}</span>
                  </div>
                </div>

                {/* Method selector */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-medium block">
                    Select Digital Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                      { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                      { id: 'NetBanking', label: 'Net Banking', icon: Smartphone },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center space-y-1 cursor-pointer ${
                            paymentMethod === m.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Simulated Hackathon Clearance — Instant Mock Settlement</span>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {paying ? 'Authorizing Payment...' : `Confirm & Pay ₹${selectedFine.amount}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinesPage;
