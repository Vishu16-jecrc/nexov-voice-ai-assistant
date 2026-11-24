import React from 'react';
import { PhoneCall, ChevronDown, User, LogOut } from 'lucide-react';
import { AuthUser } from './LoginModal';

interface HeaderProps {
  onStartCall: () => void;
  isCallActive: boolean;
  onScrollToDoctors: () => void;
  onScrollToAppointments: () => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onStartCall,
  isCallActive,
  onScrollToDoctors,
  onScrollToAppointments,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        
        {/* Left: Practo-style Logo & Primary Nav */}
        <div className="flex items-center space-x-8">
          
          {/* Logo with Practo dot styling */}
          <div className="flex items-center space-x-1 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-2xl font-black tracking-tight text-[#1c2b53]">nexov</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-zinc-700">
            <button 
              onClick={onScrollToDoctors}
              className="hover:text-sky-600 transition-colors"
            >
              Find Doctors
            </button>
            <button 
              onClick={onStartCall}
              className="hover:text-sky-600 transition-colors flex items-center space-x-1"
            >
              <span>Voice Consult</span>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-bold uppercase">
                AI
              </span>
            </button>
            <button 
              onClick={onScrollToAppointments}
              className="hover:text-sky-600 transition-colors"
            >
              Appointments
            </button>
            <span className="text-zinc-400">Surgeries</span>
          </nav>
        </div>

        {/* Right Nav: Auth + Voice Consultation Trigger */}
        <div className="flex items-center space-x-4 text-xs text-zinc-600">
          
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-zinc-900">
              <span className="bg-[#28328c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
              <span className="font-medium">For Clinics</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-zinc-300">|</span>
          </div>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-1.5">
              <User className="w-3.5 h-3.5 text-zinc-600" />
              <div className="text-left font-sans">
                <span className="font-bold text-black text-xs block leading-tight">
                  {currentUser.full_name || currentUser.username}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                  {currentUser.phone_number}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="ml-1 p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-black transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-300 hover:border-black text-black font-bold text-xs transition-colors bg-white hover:bg-zinc-50 shadow-sm"
            >
              Login / Signup
            </button>
          )}

          {/* Primary Voice Action */}
          <button
            onClick={onStartCall}
            disabled={isCallActive}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isCallActive
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                : 'bg-[#1c2b53] hover:bg-[#28328c] text-white hover:shadow'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isCallActive ? 'Call in Progress...' : 'Instant Voice Call'}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
