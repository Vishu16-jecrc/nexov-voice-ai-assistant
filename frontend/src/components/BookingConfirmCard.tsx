import React from 'react';
import { CheckCircle2, Calendar, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BookingConfirmation } from '../types';

interface BookingConfirmCardProps {
  confirmation: BookingConfirmation;
}

export const BookingConfirmCard: React.FC<BookingConfirmCardProps> = ({ confirmation }) => {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 text-left shadow-lg animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center space-x-2 text-black mb-2.5">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-black" />
        <span className="text-xs font-extrabold tracking-wide uppercase">Appointment Confirmed</span>
        <span className="text-[10px] font-mono text-zinc-500 ml-auto font-bold">#{confirmation.appointment_id}</span>
      </div>

      <div className="border-t border-zinc-200 pt-2.5 space-y-2">
        <div>
          <h4 className="font-extrabold text-sm text-black">{confirmation.doctor_name}</h4>
          <p className="text-xs text-zinc-600 font-semibold">{confirmation.specialty}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-800">
          <div className="flex items-center space-x-1.5 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span className="font-mono text-[11px] font-bold">{confirmation.date}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span className="font-mono text-[11px] font-bold">{confirmation.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-600 pt-1 font-medium">
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-zinc-400" />
            <span className="font-mono text-[11px]">{confirmation.phone_number}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px]">{confirmation.room_number || "Suite 302"}</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center space-x-1 text-black font-semibold">
          <ShieldCheck className="w-3 h-3" />
          <span>Synced with Clinic EHR</span>
        </span>
        <span className="text-zinc-400">No login required</span>
      </div>
    </div>
  );
};
