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
    <div id="appointments-section" className="w-full max-w-6xl mx-auto px-4 my-10">
      
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-bold text-[#1c2b53] tracking-tight">
              Real-time Appointments Registry
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Synced instantly with Voice AI telephone bookings and cancellations
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search phone or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-50 border border-zinc-300 text-xs rounded-lg pl-8 pr-3 py-1.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-sky-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-50 border border-zinc-300 text-xs text-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Caller Phone</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 italic">
                    No appointments found matching "{searchTerm}".
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
                          ? 'bg-sky-50 ring-1 ring-sky-400 font-semibold' 
                          : 'hover:bg-zinc-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-zinc-400 font-medium">#{apt.id}</td>
                      
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-zinc-900 tracking-wide block">
                              {apt.phone_number}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {apt.patient_name || "Caller"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-[#1c2b53] block">{apt.doctor_name}</span>
                          <span className="text-[11px] text-zinc-500 font-medium">{apt.specialty}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                            {apt.appointment_date}
                          </span>
                          <span className="text-zinc-900 font-bold">{apt.appointment_time}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {apt.status === 'confirmed' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {apt.status === 'cancelled' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-400 border border-zinc-200 line-through">
                            <XCircle className="w-3 h-3 text-zinc-400" />
                            <span>Cancelled</span>
                          </span>
                        )}
                        {apt.status === 'completed' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 max-w-[200px] truncate text-[11px] font-medium">
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

    </div>
  );
};
