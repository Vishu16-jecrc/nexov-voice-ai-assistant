import React from 'react';
import { PhoneCall, Activity, Sparkles, Cpu, Mic, Volume2 } from 'lucide-react';

interface HeaderProps {
  onStartCall: () => void;
  isCallActive: boolean;
  pipelineHealth: {
    pipeline: string;
    llm: string;
    tts: string;
    stt: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onStartCall, isCallActive, pipelineHealth }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 p-[1.5px] shadow-lg shadow-brand-500/20">
            <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">NEXOV<span className="text-brand-400">AI</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                Clinical Voice AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Doctor Appointment Intelligence & Scheduling</p>
          </div>
        </div>

        {/* Pipeline Architecture Badges */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-medium text-slate-400">Pipeline:</span>
            <span className="text-slate-200 font-mono">{pipelineHealth.pipeline}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-200 font-mono">{pipelineHealth.stt}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200 font-mono">{pipelineHealth.llm}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-200 font-mono">{pipelineHealth.tts}</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onStartCall}
            disabled={isCallActive}
            className={`relative group inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
              isCallActive 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isCallActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                <span>Call in Progress...</span>
              </>
            ) : (
              <>
                <PhoneCall className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Try Voice Call</span>
                <span className="hidden sm:inline-block text-[11px] font-normal opacity-80 bg-white/20 px-1.5 py-0.5 rounded ml-1">
                  Agent Aria
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
