import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login, register, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('officer@traffic.gov');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let res;
    if (isRegister) {
      res = await register({ name, email, password, role, phone });
    } else {
      res = await login(email, password);
    }

    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const demoAccounts = [
    { role: 'officer', label: 'Traffic Officer', email: 'officer@traffic.gov', badge: 'TP-DL-4482' },
    { role: 'citizen', label: 'Citizen Reporter', email: 'citizen@citizen.in', badge: 'Civic' },
    { role: 'owner', label: 'Vehicle Owner', email: 'owner@citizen.in', badge: 'DL-01-AB-1234' },
    { role: 'driver', label: 'Driver', email: 'driver@citizen.in', badge: 'Linked' },
    { role: 'admin', label: 'System Admin', email: 'admin@traffic.gov', badge: 'HQ' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl shadow-xl shadow-indigo-600/20 text-white">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TRAFFIC<span className="text-cyan-400">PULSE</span> AI
          </h1>
          <p className="text-xs text-slate-400">
            Smart Traffic Monitoring & Autonomous Violation Management
          </p>
        </div>

        {/* 1-Click Demo Login Box (For Hackathon Judges) */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hackathon 1-Click Fast Login:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await quickSwitchRole(acc.role);
                  setLoading(false);
                  navigate('/');
                }}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500 text-left transition hover:bg-slate-800 flex flex-col justify-between cursor-pointer"
              >
                <span className="font-semibold text-white truncate text-[11px]">{acc.label}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex border-b border-slate-800 pb-2">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-2 text-xs font-semibold text-center transition ${
                !isRegister ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-2 text-xs font-semibold text-center transition ${
                isRegister ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="citizen">Citizen Reporter</option>
                    <option value="owner">Vehicle Owner</option>
                    <option value="driver">Driver</option>
                    <option value="officer">Traffic Police Officer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
