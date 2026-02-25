import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Lock, HardDrive, Terminal } from 'lucide-react';

const Dashboard = () => {
  const [threats, setThreats] = useState(0);
  const [status, setStatus] = useState("SECURE");

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-cyan-500">ZeroNa <span className="text-white">v1.0</span></h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-1 font-bold">Ransomware Protection Suite</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 px-4 py-2 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500 font-bold text-xs uppercase">Engine Online</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Readiness Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={80} />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Readiness Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">88</span>
            <span className="text-cyan-500 font-bold">%</span>
          </div>
          <p className="text-slate-500 text-xs mt-4">System is highly resistant to encryption attempts.</p>
        </div>

        {/* Live Threats Card */}
        <div className={`p-6 rounded-xl border transition-all ${threats > 0 ? 'bg-red-500/10 border-red-500' : 'bg-slate-900/40 border-slate-800'}`}>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Active Threats</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${threats > 0 ? 'text-red-500' : 'text-white'}`}>{threats}</span>
          </div>
          <p className="text-slate-500 text-xs mt-4 font-mono">Real-time I/O monitoring active...</p>
        </div>

        {/* Network Health */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Integrity Status</h3>
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500" />
            <span className="text-2xl font-bold uppercase tracking-tight">{status}</span>
          </div>
          <p className="text-slate-500 text-xs mt-6 italic">Last backup verified: 14 mins ago</p>
        </div>
      </div>

      {/* Console Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 font-mono text-sm h-64 overflow-hidden">
        <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800 pb-2">
          <Terminal size={16} />
          <span>SYSTEM_LOG_FEED</span>
        </div>
        <div className="space-y-1 text-xs">
          <p className="text-cyan-500">[INIT] Initializing file system listeners...</p>
          <p className="text-slate-400">[INFO] Watchdog started on C:/Users/deena/ZeroNa-Project</p>
          <p className="text-green-500">[OK] Connection to FastAPI backend established.</p>
          <p className="text-slate-500">[SCAN] Scanning for known ransomware extensions (.locked, .crypt)...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;