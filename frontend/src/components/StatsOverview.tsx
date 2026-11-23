import React from 'react';
import { Users, CalendarCheck, Clock, Zap } from 'lucide-react';
import { ClinicStats } from '../types';

interface StatsOverviewProps {
  stats: ClinicStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Doctors */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Specialists</span>
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.totalDoctors}</span>
          <span className="ml-2 text-xs text-brand-400 font-medium">On Active Duty</span>
        </div>
      </div>

      {/* Open Slots Today */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Open Slots Today</span>
          <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.openSlotsToday}</span>
          <span className="ml-2 text-xs text-sky-400 font-medium">Instant Booking</span>
        </div>
      </div>

      {/* Confirmed Appointments */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Booked Visits</span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.confirmedAppointments}</span>
          <span className="ml-2 text-xs text-emerald-400 font-medium">Synced via Voice</span>
        </div>
      </div>

      {/* Voice AI Engine */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipecat Pipeline</span>
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-white">Live & Ready</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">~320ms</span>
        </div>
      </div>
    </div>
  );
};
