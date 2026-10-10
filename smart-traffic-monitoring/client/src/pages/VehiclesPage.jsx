import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import {
  Car,
  Search,
  Plus,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  X,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // New vehicle form state
  const [newReg, setNewReg] = useState({
    registrationNumber: '',
    makeModel: '',
    type: 'Car',
    color: 'Polar White',
    ownerName: user?.role === 'owner' ? user.name : '',
    ownerEmail: user?.role === 'owner' ? user.email : '',
    ownerPhone: '+91 ',
    linkedDriverName: '',
    linkedDriverEmail: ''
  });
  const [formMsg, setFormMsg] = useState({ error: '', success: '' });

  // Driver link modal state
  const [isLinkDriverOpen, setIsLinkDriverOpen] = useState(false);
  const [driverInput, setDriverInput] = useState({ name: '', email: '' });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles', {
        params: { search, type: typeFilter }
      });
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Fetch vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, typeFilter, user?.role]);

  const handleOpenDetails = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/vehicles/${vehicle.registrationNumber}`);
      setVehicleDetails(res.data);
    } catch (err) {
      console.error('Fetch vehicle history error:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormMsg({ error: '', success: '' });

    if (!newReg.registrationNumber || !newReg.makeModel) {
      setFormMsg({ error: 'Registration number and Model are required.', success: '' });
      return;
    }

    try {
      const res = await api.post('/vehicles', newReg);
      setFormMsg({ error: '', success: 'Vehicle successfully registered!' });
      setTimeout(() => {
        setIsRegisterOpen(false);
        setFormMsg({ error: '', success: '' });
        fetchVehicles();
      }, 1000);
    } catch (err) {
      setFormMsg({
        error: err.response?.data?.message || 'Failed to register vehicle.',
        success: ''
      });
    }
  };

  const handleLinkDriver = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/vehicles/${selectedVehicle._id}/driver`, {
        linkedDriverName: driverInput.name,
        linkedDriverEmail: driverInput.email
      });
      setIsLinkDriverOpen(false);
      handleOpenDetails(selectedVehicle);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to link driver.');
    }
  };

  const role = user?.role || 'citizen';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {role === 'owner' ? 'My Registered Vehicles' : role === 'driver' ? 'Assigned Vehicle' : 'Vehicle Registry Database'}
          </h1>
          <p className="text-xs text-slate-400">
            Official central vehicle licensing, owner attribution, and driver assignment registry
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search plate (e.g. DL-01-AB-1234), model, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          {['All', 'Car', 'Motorcycle', 'Truck', 'Auto-Rickshaw', 'EV'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                typeFilter === type
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid / Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Car className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">No vehicles found</p>
          <p className="text-xs text-slate-500 mt-1">Try refining your search filter or register a new vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v._id || v.registrationNumber}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-lg shadow-black/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {v.type}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-1.5 tracking-tight group-hover:text-indigo-400 transition">
                      {v.registrationNumber}
                    </h3>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="font-medium text-slate-200">{v.makeModel}</div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Owner: {v.ownerName}</span>
                  </div>
                  {v.linkedDriverName && (
                    <div className="text-cyan-400 text-[11px] flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Driver: {v.linkedDriverName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Color: {v.color || 'White'}
                </span>
                <button
                  onClick={() => handleOpenDetails(v)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  <span>Audit History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Details & Audit Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">{selectedVehicle.registrationNumber}</h2>
                  <p className="text-xs text-slate-400">{selectedVehicle.makeModel} • {selectedVehicle.color}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ownership & Driver Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block font-medium">Registered Owner</span>
                <p className="font-semibold text-white text-sm">{selectedVehicle.ownerName}</p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedVehicle.ownerEmail}</p>
                <p className="text-slate-400 text-[11px]">{selectedVehicle.ownerPhone || 'Phone on file'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Driver</span>
                  <p className="font-semibold text-cyan-300 text-sm">
                    {selectedVehicle.linkedDriverName || 'No Driver Assigned'}
                  </p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {selectedVehicle.linkedDriverEmail || 'Direct Owner Operated'}
                  </p>
                </div>
                {(role === 'owner' || role === 'admin') && (
                  <button
                    onClick={() => {
                      setDriverInput({
                        name: selectedVehicle.linkedDriverName || '',
                        email: selectedVehicle.linkedDriverEmail || ''
                      });
                      setIsLinkDriverOpen(true);
                    }}
                    className="mt-2 text-left text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    + Assign / Update Driver
                  </button>
                )}
              </div>
            </div>

            {/* Infraction & Challan History */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Violation Records & Challans ({vehicleDetails?.violations?.length || 0})
              </h4>

              {detailsLoading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
              ) : vehicleDetails?.violations && vehicleDetails.violations.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {vehicleDetails.violations.map((violation) => (
                    <div
                      key={violation._id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-indigo-300">{violation.violationNumber}</span>
                          <span className="font-semibold text-white">{violation.violationType}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{violation.location}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={violation.status} />
                        <span className="block text-[11px] font-mono text-amber-400 mt-1">₹{violation.fineAmount || 1000}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-emerald-400">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  Clean driving record! No infractions logged for this vehicle.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Link Modal */}
      {isLinkDriverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Assign Driver to {selectedVehicle?.registrationNumber}</h3>
            <form onSubmit={handleLinkDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={driverInput.name}
                  onChange={(e) => setDriverInput({ ...driverInput, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Driver Email</label>
                <input
                  type="email"
                  required
                  placeholder="driver@citizen.in"
                  value={driverInput.email}
                  onChange={(e) => setDriverInput({ ...driverInput, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkDriverOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Vehicle Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Register New Vehicle</h2>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg.error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs">
                {formMsg.error}
              </div>
            )}
            {formMsg.success && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 text-xs">
                {formMsg.success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Registration Number Plate (uppercase) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-04-XY-9999"
                  value={newReg.registrationNumber}
                  onChange={(e) => setNewReg({ ...newReg, registrationNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Make & Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maruti Suzuki Swift"
                    value={newReg.makeModel}
                    onChange={(e) => setNewReg({ ...newReg, makeModel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Vehicle Type</label>
                  <select
                    value={newReg.type}
                    onChange={(e) => setNewReg({ ...newReg, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Polar White"
                    value={newReg.color}
                    onChange={(e) => setNewReg({ ...newReg, color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newReg.ownerName}
                    onChange={(e) => setNewReg({ ...newReg, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@citizen.in"
                    value={newReg.ownerEmail}
                    onChange={(e) => setNewReg({ ...newReg, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Owner Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newReg.ownerPhone}
                    onChange={(e) => setNewReg({ ...newReg, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
