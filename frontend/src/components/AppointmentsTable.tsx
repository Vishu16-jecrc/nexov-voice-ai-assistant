import React, { useState } from 'react';
import { Appointment } from '../types';
import { Phone, Search, CheckCircle2, XCircle } from 'lucide-react';

interface AppointmentsTableProps {
  appointments: Appointment[];
  highlightedAptId: number | null;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, highlightedAptId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.phone_number.includes(searchTerm) ||
      apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Active Appointments & Registry</h2>
          <p className="text-xs text-slate-400">Real-time bookings synchronized with the voice agent pipeline</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search phone, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Caller / Phone</th>
              <th className="py-3 px-4">Doctor & Specialty</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                  No appointments match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => {
                const isRecentlyUpdated = highlightedAptId === apt.id;

                return (
                  <tr 
                    key={apt.id}
                    className={`transition-colors duration-500 ${
                      isRecentlyUpdated 
                        ? 'bg-brand-500/20 ring-1 ring-brand-400/50 animate-pulse' 
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-400">#{apt.id}</td>
                    
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-brand-400" />
                        </div>
                        <div>
                          <span className="font-mono font-semibold text-white tracking-wide block">
                            {apt.phone_number}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {apt.patient_name || "Caller"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-200 block">{apt.doctor_name}</span>
                        <span className="text-[11px] text-brand-400/90 font-medium">{apt.specialty}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {apt.appointment_date}
                        </span>
                        <span className="text-slate-200 font-medium">{apt.appointment_time}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {apt.status === 'confirmed' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      )}
                      {apt.status === 'cancelled' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Cancelled</span>
                        </span>
                      )}
                      {apt.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate text-[11px]">
                      {apt.notes || "Booked via Nexov Voice AI"}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
