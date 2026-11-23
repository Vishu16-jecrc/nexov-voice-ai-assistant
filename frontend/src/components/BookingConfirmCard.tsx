import React from 'react';
import { CheckCircle2, Calendar, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BookingConfirmation } from '../types';

interface BookingConfirmCardProps {
  confirmation: BookingConfirmation;
}

export const BookingConfirmCard: React.FC<BookingConfirmCardProps> = ({ confirmation }) => {
  return (
    <div className="bg-gradient-to-b from-brand-950/80 to-slate-900/90 border border-brand-500/40 rounded-2xl p-4 text-left shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center space-x-2 text-emerald-400 mb-2.5">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="text-xs font-bold tracking-wide uppercase">Appointment Confirmed</span>
        <span className="text-[10px] font-mono text-slate-400 ml-auto">#{confirmation.appointment_id}</span>
      </div>

      <div className="border-t border-brand-500/20 pt-2.5 space-y-2">
        <div>
          <h4 className="font-bold text-sm text-white">{confirmation.doctor_name}</h4>
          <p className="text-xs text-brand-300 font-medium">{confirmation.specialty}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-mono text-[11px]">{confirmation.date}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-mono text-[11px]">{confirmation.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-slate-500" />
            <span className="font-mono text-[11px]">{confirmation.phone_number}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span className="text-[11px]">{confirmation.room_number || "Suite 302"}</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center space-x-1 text-emerald-400/90 font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>Synced with Clinic EHR</span>
        </span>
        <span className="text-slate-500">No login required</span>
      </div>
    </div>
  );
};
