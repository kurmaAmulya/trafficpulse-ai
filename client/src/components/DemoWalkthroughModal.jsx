import React from 'react';
import { X, PlayCircle, CheckCircle, ShieldAlert, Video, CreditCard, Award, ArrowRight } from 'lucide-react';

export const DemoWalkthroughModal = ({ isOpen, onClose, onSwitchRole }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      role: 'citizen',
      roleTitle: 'Citizen Reporter',
      title: 'Report a Live Violation',
      action: 'Click "Report Violation" in the sidebar. Fill in plate (e.g. DL-01-AB-1234), select violation type, upload photo evidence, and submit. Status starts as Pending.',
      icon: ShieldAlert,
      color: 'text-amber-400'
    },
    {
      num: 2,
      role: 'officer',
      roleTitle: 'Traffic Officer',
      title: 'Review & Verify Evidence',
      action: 'Go to "All Reports". Click "Review Report", inspect high-res evidence, add officer notes, and click "Verify Violation". Notice that an e-challan is instantly issued!',
      icon: CheckCircle,
      color: 'text-emerald-400'
    },
    {
      num: 3,
      role: 'officer',
      roleTitle: 'Traffic Officer',
      title: 'Simulate CCTV AI Radar Feed',
      action: 'Visit "Camera Monitoring". See live simulated feeds. Click "Trigger AI Plate Capture (Demo)" to test automated edge detection. A new infraction is pushed immediately.',
      icon: Video,
      color: 'text-indigo-400'
    },
    {
      num: 4,
      role: 'owner',
      roleTitle: 'Vehicle Owner',
      title: 'View & Pay Traffic Challans',
      action: 'Switch to Vehicle Owner (Rajesh Sharma). Check "My Vehicles" and "Fines". Settle pending challans instantly using the simulated UPI / QR payment modal.',
      icon: CreditCard,
      color: 'text-cyan-400'
    },
    {
      num: 5,
      role: 'admin',
      roleTitle: 'HQ Admin',
      title: 'Analytics & Live MongoDB Status',
      action: 'Examine system stats, violation type breakdown charts, live MongoDB cluster connection health, and export/audit logs.',
      icon: Award,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hackathon 2-Minute Demo Workflow</h2>
              <p className="text-xs text-slate-400">Step-by-step presentation script to impress judges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
                    {step.num}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${step.color}`}>
                        {step.roleTitle}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {step.action}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSwitchRole(step.role);
                    onClose();
                  }}
                  className="flex-shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white transition cursor-pointer"
                >
                  <span>Switch to {step.roleTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: You can switch roles at any time using the role selector pill in the top navbar.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Got it, Let's Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoWalkthroughModal;
