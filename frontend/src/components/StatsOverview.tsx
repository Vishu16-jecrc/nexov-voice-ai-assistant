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
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Specialists</span>
          <div className="p-2 bg-zinc-100 rounded-xl text-black">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">{stats.totalDoctors}</span>
          <span className="ml-2 text-xs text-zinc-500 font-medium">On Active Duty</span>
        </div>
      </div>

      {/* Open Slots Today */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Open Slots Today</span>
          <div className="p-2 bg-zinc-100 rounded-xl text-black">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">{stats.openSlotsToday}</span>
          <span className="ml-2 text-xs text-zinc-500 font-medium">Instant Booking</span>
        </div>
      </div>

      {/* Confirmed Appointments */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Booked Visits</span>
          <div className="p-2 bg-zinc-100 rounded-xl text-black">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">{stats.confirmedAppointments}</span>
          <span className="ml-2 text-xs text-zinc-500 font-medium">Synced via Voice</span>
        </div>
      </div>

      {/* Voice AI Engine */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pipecat Pipeline</span>
          <div className="p-2 bg-zinc-100 rounded-xl text-black">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            <span className="text-sm font-bold text-black">Live & Ready</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">~320ms</span>
        </div>
      </div>
    </div>
  );
};
