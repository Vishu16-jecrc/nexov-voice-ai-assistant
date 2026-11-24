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
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-black tracking-tight">Active Appointments & Registry</h2>
          <p className="text-xs text-zinc-500">Real-time bookings synchronized with the voice agent pipeline</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search phone, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-xs rounded-xl pl-8 pr-3 py-1.5 text-black placeholder-zinc-400 focus:outline-none focus:border-black w-44 sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-black font-medium"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Caller / Phone</th>
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
                        ? 'bg-zinc-100 ring-1 ring-black/30 font-semibold' 
                        : 'hover:bg-zinc-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-zinc-400 font-medium">#{apt.id}</td>
                    
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-black tracking-wide block">
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
                        <span className="font-bold text-black block">{apt.doctor_name}</span>
                        <span className="text-[11px] text-zinc-500 font-medium">{apt.specialty}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                          {apt.appointment_date}
                        </span>
                        <span className="text-black font-semibold">{apt.appointment_time}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {apt.status === 'confirmed' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black text-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-white" />
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
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-200 text-zinc-800">
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
  );
};
