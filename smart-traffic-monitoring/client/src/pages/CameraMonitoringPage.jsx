import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  Camera,
  Activity,
  Zap,
  Radio,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Eye,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CameraMonitoringPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCam, setSelectedCam] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);

  // Simulation inputs
  const [testPlate, setTestPlate] = useState('DL-01-AB-1234');
  const [testViolation, setTestViolation] = useState('Speeding');
  const [testSpeed, setTestSpeed] = useState(86);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cameras');
      setCameras(res.data.cameras || []);
      if (res.data.cameras?.length > 0 && !selectedCam) {
        setSelectedCam(res.data.cameras[0]);
      }
    } catch (err) {
      console.error('Fetch cameras error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleTriggerDetection = async (e) => {
    e.preventDefault();
    setTriggering(true);
    setTriggerResult(null);

    try {
      const res = await api.post('/cameras/trigger-detection', {
        cameraId: selectedCam?.cameraId || 'CAM-ND-01',
        vehicleNumber: testPlate,
        violationType: testViolation,
        speed: Number(testSpeed)
      });
      setTriggerResult(res.data);
      fetchCameras();
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation trigger failed.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear Demo Disclaimer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Simulated AI CCTV & Radar Surveillance
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                DEMO SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Simulates optical character recognition (ANPR) and automated radar speed tracking.
              This is a demonstration pipeline showing how camera detections translate into queued traffic officer violations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
              <span>4 NODES ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Cam Feed + Interactive Edge Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Feed Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            {/* Feed Topbar */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 radar-live" />
                <span className="font-mono font-bold text-white">{selectedCam?.name || 'Janpath Camera Alpha'}</span>
                <span className="text-slate-500 font-mono">[{selectedCam?.cameraId}]</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                <span>RES: {selectedCam?.resolution || '1080p 60FPS'}</span>
                <span>FPS: {selectedCam?.fps || 30}</span>
                <span className="text-indigo-400">{selectedCam?.aiModel}</span>
              </div>
            </div>

            {/* Simulated Live View Canvas */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {/* Traffic Background Simulation */}
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"
                alt="Simulated Camera Stream"
                className="w-full h-full object-cover opacity-80"
              />

              {/* HUD / Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top Overlay HUD */}
                <div className="flex justify-between items-start text-xs font-mono">
                  <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 space-y-0.5">
                    <div className="text-emerald-400 flex items-center space-x-1">
                      <Radio className="w-3.5 h-3.5" />
                      <span>LIVE FEED • RADAR SYNC</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">{selectedCam?.locationName}</div>
                  </div>

                  <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-right">
                    <div className="text-slate-400 text-[10px]">ZONE: {selectedCam?.zone}</div>
                    <div className="text-amber-300 font-bold">{new Date().toLocaleTimeString()}</div>
                  </div>
                </div>

                {/* Target Detection Box Graphic */}
                <div className="self-center border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 p-3 rounded-lg text-center backdrop-blur-[1px] animate-pulse">
                  <span className="text-[10px] font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold block mb-1">
                    ANPR OCR LOCKED • 98.4%
                  </span>
                  <span className="font-mono font-bold text-white text-base tracking-wider">
                    {selectedCam?.lastPlateDetected || 'DL-01-AB-1234'}
                  </span>
                  <span className="block text-xs font-mono text-amber-300 mt-0.5">
                    RADAR: {selectedCam?.speedDetectedKmH || 48} km/h
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800 self-start">
                  AI ENGINE: YOLOv11-Edge-Traffic • BUFFER: ZERO LATENCY
                </div>
              </div>
            </div>

            {/* Camera Selectors List */}
            <div className="p-3 bg-slate-950/70 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cameras.map((cam) => (
                <button
                  key={cam.cameraId}
                  onClick={() => setSelectedCam(cam)}
                  className={`p-2 rounded-xl text-left transition border cursor-pointer ${
                    selectedCam?.cameraId === cam.cameraId
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold truncate">{cam.cameraId}</div>
                  <div className="text-[10px] text-slate-400 truncate">{cam.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Trigger Simulator & Live OCR Detections */}
        <div className="space-y-4">
          {/* Interactive Trigger Simulator Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Simulate AI Edge Detection</h3>
                <p className="text-[11px] text-slate-400">Trigger simulated ANPR event into the live system</p>
              </div>
            </div>

            {triggerResult && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-1.5 animate-fade-in">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Infraction Successfully Pushed!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Incident ticket <span className="font-mono text-white font-bold">{triggerResult.violationNumber}</span> has been queued for verification.
                </p>
                <button
                  onClick={() => navigate('/all-reports')}
                  className="mt-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Go Review Report →
                </button>
              </div>
            )}

            <form onSubmit={handleTriggerDetection} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Target Vehicle Number Plate
                </label>
                <input
                  type="text"
                  required
                  value={testPlate}
                  onChange={(e) => setTestPlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Violation Event
                </label>
                <select
                  value={testViolation}
                  onChange={(e) => setTestViolation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Speeding">Speeding (Exceeding Zone Limit)</option>
                  <option value="Red Light Jumping">Red Light Jumping</option>
                  <option value="No Helmet">No Helmet Detected</option>
                  <option value="Wrong-Way Driving">Wrong-Way Driving</option>
                  <option value="Using Mobile Phone">Phone Usage While Driving</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Speed Radar Measurement (km/h)
                </label>
                <input
                  type="number"
                  value={testSpeed}
                  onChange={(e) => setTestSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={triggering}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{triggering ? 'Processing AI Event...' : 'Trigger AI Plate Capture (Demo)'}</span>
              </button>
            </form>
          </div>

          {/* Recent Detection Stream */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent OCR Detections ({selectedCam?.name})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {selectedCam?.recentDetections && selectedCam.recentDetections.length > 0 ? (
                selectedCam.recentDetections.map((det, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">{det.plate}</div>
                      <div className="text-[10px] text-slate-400">{det.violation}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[11px] text-emerald-400">{det.confidence}%</span>
                      <span className="block text-[10px] text-slate-500">
                        {det.speed ? `${det.speed} km/h` : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">No recent detection stream.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraMonitoringPage;
