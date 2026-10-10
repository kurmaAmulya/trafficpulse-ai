import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  AlertTriangle,
  Upload,
  Camera,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Car
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportViolationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vehicleNumber: 'DL-01-AB-1234',
    violationType: 'Red Light Jumping',
    location: 'Janpath - Tolstoy Marg Intersection, New Delhi',
    dateTime: new Date().toISOString().slice(0, 16),
    description: 'Vehicle deliberately sped past the stop line after the traffic signal turned red.',
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleEvidencePresets = [
    { label: 'Red Light', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
    { label: 'Speeding Car', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80' },
    { label: 'No Helmet Bike', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
    { label: 'Illegal Parking', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSelectSample = (sampleUrl) => {
    setFile(null);
    setPreview(sampleUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const data = new FormData();
      data.append('vehicleNumber', form.vehicleNumber.trim().toUpperCase());
      data.append('violationType', form.violationType);
      data.append('location', form.location);
      data.append('dateTime', form.dateTime);
      data.append('description', form.description);

      if (file) {
        data.append('evidenceImage', file);
      } else {
        data.append('evidenceUrl', preview);
      }

      const res = await api.post('/violations', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data.violation);
    } catch (err) {
      console.error('Submit report error:', err);
      setError(err.response?.data?.message || 'Failed to submit traffic report. Please check input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Report Traffic Violation
            </h1>
            <p className="text-xs text-slate-400">
              Submit verified photographic or dashcam evidence of reckless driving or traffic code breach
            </p>
          </div>
        </div>
      </div>

      {result ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-4 shadow-2xl animate-fade-in">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Incident Report Logged Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your violation report has been catalogued under reference ID{' '}
            <span className="font-mono font-bold text-indigo-400">{result.violationNumber}</span> and queued for traffic officer verification.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs max-w-md mx-auto text-left space-y-1.5 font-mono">
            <div><span className="text-slate-500">Plate:</span> <span className="text-white font-bold">{result.vehicleNumber}</span></div>
            <div><span className="text-slate-500">Type:</span> <span className="text-amber-400">{result.violationType}</span></div>
            <div><span className="text-slate-500">Location:</span> <span className="text-slate-300">{result.location}</span></div>
            <div><span className="text-slate-500">Initial Status:</span> <span className="text-emerald-400">{result.status}</span></div>
          </div>

          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => {
                setResult(null);
                setForm({
                  ...form,
                  vehicleNumber: '',
                  description: ''
                });
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Submit Another Report
            </button>
            <button
              onClick={() => navigate(user?.role === 'citizen' ? '/my-reports' : '/all-reports')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              View in Reports Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Form Details */}
          <div className="md:col-span-2 space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Vehicle Registration Number (Plate) *
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-01-AB-1234"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Violation Type *</label>
                <select
                  value={form.violationType}
                  onChange={(e) => setForm({ ...form, violationType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Speeding">Speeding (Over Limit)</option>
                  <option value="Red Light Jumping">Red Light Jumping</option>
                  <option value="No Helmet">No Helmet (Rider / Pillion)</option>
                  <option value="Wrong-Way Driving">Wrong-Way Driving</option>
                  <option value="Illegal Parking">Illegal Parking / No-Parking Zone</option>
                  <option value="Triple Riding">Triple Riding on Two-Wheeler</option>
                  <option value="Using Mobile Phone">Using Mobile Phone while Driving</option>
                  <option value="Drunk Driving">Drunk Driving / Reckless Maneuver</option>
                  <option value="Seatbelt Violation">Seatbelt Violation</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Incident Date & Time *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="datetime-local"
                    required
                    value={form.dateTime}
                    onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Location of Infraction *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place Inner Circle, Block B"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Incident Description / Observations</label>
              <textarea
                rows={3}
                placeholder="Describe lane behavior, weather condition, or vehicle make..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Logged under: <span className="text-white font-medium">{user?.name}</span> ({user?.role})
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Uploading Evidence...' : 'Submit Violation Report'}
              </button>
            </div>
          </div>

          {/* Right Column: Evidence Upload & Live Preview */}
          <div className="space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Photographic Evidence</span>
            </h3>

            {/* Image Preview Box */}
            <div className="relative h-44 rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-center p-4">
                  <Upload className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No image selected</span>
                </div>
              )}
            </div>

            {/* Custom file upload */}
            <div>
              <label className="block w-full py-2 px-3 text-center rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-300 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition">
                <span>Select file from computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Demo Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Or pick instant demo evidence:</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleEvidencePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectSample(preset.url)}
                    className="p-1.5 text-[10px] rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition text-center truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportViolationPage;
