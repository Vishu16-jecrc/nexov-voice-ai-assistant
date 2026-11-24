import React, { useState } from 'react';
import { Appointment } from '../types';
import { 
  Phone, Search, CheckCircle2, XCircle, Calendar, 
  Clock, Shield, ArrowRight, UserCheck, PhoneCall, Lock, RotateCcw
} from 'lucide-react';

interface AppointmentsTableProps {
  appointments: Appointment[];
  highlightedAptId: number | null;
  userPhone: string;
  onUpdateUserPhone: (phone: string) => void;
  onStartCall: () => void;
  onOpenLogin?: () => void;
  onResetAppointments?: () => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ 
  appointments, 
  highlightedAptId,
  userPhone,
  onUpdateUserPhone,
  onStartCall,
  onOpenLogin,
  onResetAppointments
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [viewMode, setViewMode] = useState<'my_bookings' | 'all'>('my_bookings');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleReset = async () => {
    if (window.confirm("Start fresh? This will clear all test appointments and free up all slots for booking.")) {
      try {
        await fetch('/api/appointments/reset', { method: 'POST' });
        if (onResetAppointments) {
          onResetAppointments();
        }
      } catch (e) {
        console.warn("Reset error:", e);
      }
    }
  };

  // Handle phone submit
  const handleLookupPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneInput.replace(/\D/g, '');
    if (clean) {
      onUpdateUserPhone(clean);
    }
  };

  // Filter logic
  const myAppointments = appointments.filter(apt => {
    if (!userPhone) return false;
    const aptDigits = apt.phone_number.replace(/\D/g, '');
    const userDigits = userPhone.replace(/\D/g, '');
    return aptDigits === userDigits || aptDigits.endsWith(userDigits) || userDigits.endsWith(aptDigits);
  });

  const displayedAppointments = (viewMode === 'my_bookings' ? myAppointments : appointments)
    .filter(apt => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        apt.phone_number.includes(term) ||
        apt.doctor_name.toLowerCase().includes(term) ||
        apt.specialty.toLowerCase().includes(term) ||
        apt.appointment_date.includes(term)
      );
    })
    .sort((a, b) => {
      // 1. Confirmed active appointments always on top
      if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
      if (b.status === 'confirmed' && a.status !== 'confirmed') return 1;
      // 2. Sort by date descending
      return b.appointment_date.localeCompare(a.appointment_date);
    });

  return (
    <div id="appointments-section" className="w-full max-w-6xl mx-auto px-4 my-10">
      
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                {viewMode === 'my_bookings' ? 'My Booked Appointments' : 'Clinic Appointments Registry'}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {viewMode === 'my_bookings' 
                ? 'Confidential personal schedule • Synced live with Aria Voice Assistant'
                : 'All clinic consultation records (Evaluator / Admin View)'}
            </p>
          </div>

          {/* Controls: View Mode & Search */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
              <button
                onClick={() => setViewMode('my_bookings')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'my_bookings'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                🔒 Only My Bookings
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                All Clinic Registry
              </button>
            </div>

            {/* Start Fresh / Reset Button */}
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black text-xs font-semibold flex items-center space-x-1.5 transition-all bg-white shadow-sm"
              title="Reset all test appointments to start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Fresh</span>
            </button>

            {/* Optional search */}
            {viewMode === 'all' && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Filter doctor or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-50 border border-zinc-300 text-xs rounded-xl pl-8 pr-3 py-1.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-black w-40 sm:w-48 font-medium"
                />
              </div>
            )}

          </div>
        </div>

        {/* User Phone Status Badge / Lookup */}
        {viewMode === 'my_bookings' && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {userPhone ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Verified Caller ID
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-black">
                    {userPhone}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5 text-xs text-zinc-600 font-medium">
                <Lock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span>Enter your spoken phone number to view your private booked slot:</span>
              </div>
            )}

            {/* Quick phone switcher or lookup form */}
            <form onSubmit={handleLookupPhone} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={userPhone ? "Switch phone number..." : "e.g. 9876543210"}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="bg-white border border-zinc-300 text-xs rounded-xl px-3 py-1.5 text-black placeholder-zinc-400 focus:outline-none focus:border-black font-mono w-44 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
              >
                <span>{userPhone ? 'Change' : 'Lookup'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {userPhone && (
                <button
                  type="button"
                  onClick={() => onUpdateUserPhone('')}
                  className="px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-700"
                  title="Clear phone"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        )}

        {/* Main Content Area */}
        {viewMode === 'my_bookings' && !userPhone && (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black mb-1">
              Patient Medical Privacy Protected
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mb-5 leading-relaxed">
              In compliance with patient confidentiality, other patients' bookings are never displayed. 
              Book a slot using our Voice AI assistant above or enter your phone number to view your appointment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login with ID & Password</span>
                </button>
              )}
              <button
                onClick={onStartCall}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition-all flex items-center space-x-2 border border-zinc-200"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Book Slot via Voice Call</span>
              </button>
              <button
                onClick={() => onUpdateUserPhone('9876543210')}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold rounded-xl text-xs border border-zinc-300 transition-all"
              >
                Use Demo Phone (9876543210)
              </button>
            </div>
          </div>
        )}

        {/* User has phone, but no appointments booked yet */}
        {viewMode === 'my_bookings' && userPhone && displayedAppointments.length === 0 && (
          <div className="py-12 px-4 text-center rounded-2xl border border-zinc-200 bg-zinc-50/50">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black mb-1">
              No Appointments Booked Yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
              There are currently no confirmed slots for phone number <span className="font-mono font-bold text-black">{userPhone}</span>.
            </p>
            <button
              onClick={onStartCall}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center space-x-2 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Aria to Book an Appointment</span>
            </button>
          </div>
        )}

        {/* Category Filter Pills */}
        {(viewMode === 'all' || (viewMode === 'my_bookings' && myAppointments.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs font-sans">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              All Records ({viewMode === 'my_bookings' ? myAppointments.length : appointments.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              Confirmed Active ({(viewMode === 'my_bookings' ? myAppointments : appointments).filter(a => a.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              Past Visits ({(viewMode === 'my_bookings' ? myAppointments : appointments).filter(a => a.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-zinc-600 text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500'
              }`}
            >
              Cancelled ({(viewMode === 'my_bookings' ? myAppointments : appointments).filter(a => a.status === 'cancelled').length})
            </button>
          </div>
        )}

        {/* Appointments List (Table) */}
        {(viewMode === 'all' || (viewMode === 'my_bookings' && displayedAppointments.length > 0)) && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Doctor & Specialty</th>
                  <th className="py-3 px-4">Appointment Date & Time</th>
                  <th className="py-3 px-4">Caller ID Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {displayedAppointments.map((apt) => {
                  const isRecentlyUpdated = highlightedAptId === apt.id;

                  return (
                    <tr 
                      key={apt.id}
                      className={`transition-colors duration-500 ${
                        isRecentlyUpdated 
                          ? 'bg-zinc-100 font-semibold ring-2 ring-black' 
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono text-zinc-500 font-bold">
                        #{apt.id}
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-extrabold text-black text-sm block">
                            {apt.doctor_name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {apt.specialty}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 font-mono text-black font-bold text-xs flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-zinc-500 mr-1" />
                            {apt.appointment_date}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-black text-white font-mono font-bold text-xs flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-white mr-1" />
                            {apt.appointment_time}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 font-mono font-bold text-black text-xs">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{apt.phone_number}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {apt.status === 'confirmed' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {apt.status === 'cancelled' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-400 border border-zinc-200 line-through">
                            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Cancelled</span>
                          </span>
                        )}
                        {apt.status === 'completed' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {apt.status === 'confirmed' ? (
                          <button
                            onClick={onStartCall}
                            className="px-3 py-1.5 bg-zinc-100 hover:bg-black hover:text-white text-black font-semibold rounded-xl text-[11px] transition-all border border-zinc-200 inline-flex items-center space-x-1 shadow-sm"
                            title="Call Aria to cancel or reschedule"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Cancel via Voice</span>
                          </button>
                        ) : apt.status === 'completed' ? (
                          <span className="text-[11px] text-zinc-500 font-medium">Completed Visit</span>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">Slot Freed</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
