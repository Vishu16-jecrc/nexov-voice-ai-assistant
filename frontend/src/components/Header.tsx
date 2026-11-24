import React from 'react';
import { PhoneCall, Activity } from 'lucide-react';

interface HeaderProps {
  onStartCall: () => void;
  isCallActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onStartCall, isCallActive }) => {
  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-black">NEXOV<span className="text-zinc-500 font-medium">AI</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                Clinical Voice AI
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">Doctor Appointment Intelligence & Scheduling</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onStartCall}
            disabled={isCallActive}
            className={`relative group inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isCallActive 
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed border border-zinc-300' 
                : 'bg-black hover:bg-zinc-800 text-white shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isCallActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-black animate-ping mr-1"></span>
                <span>Call in Progress...</span>
              </>
            ) : (
              <>
                <PhoneCall className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Try Voice Call</span>
                <span className="hidden sm:inline-block text-[11px] font-normal text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded ml-1">
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
