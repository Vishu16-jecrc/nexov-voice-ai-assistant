import React, { useState } from 'react';
import { Doctor, Slot } from '../types';
import { Star, Clock, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface DoctorsListProps {
  doctors: Doctor[];
  slots: Slot[];
  onSelectSlot?: (doctorName: string, date: string, time: string) => void;
}

export const DoctorsList: React.FC<DoctorsListProps> = ({ doctors, slots }) => {
  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedDoctorId(expandedDoctorId === id ? null : id);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Clinic Medical Staff</h2>
          <p className="text-xs text-slate-400">Board-certified doctors with live schedule availability</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
          {doctors.length} Doctors Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => {
          const docSlots = slots.filter(s => s.doctor_id === doc.id && !s.is_booked);
          const isExpanded = expandedDoctorId === doc.id;

          return (
            <div 
              key={doc.id}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200"
            >
              <div className="flex items-start space-x-3.5">
                <img 
                  src={doc.avatar} 
                  alt={doc.name} 
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white truncate">{doc.name}</h3>
                    <div className="flex items-center space-x-1 text-amber-400 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-mono font-medium">{doc.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-400 font-medium mt-0.5">{doc.specialty}</p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{doc.room_number}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-slate-500" />
                      <span>{doc.consultation_fee}</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {doc.bio}
              </p>

              {/* Slots Expand Toggle */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span><strong className="text-slate-200 font-mono">{docSlots.length}</strong> open slots</span>
                </span>

                <button
                  onClick={() => toggleExpand(doc.id)}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Schedule' : 'View Open Slots'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Open Slots list */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
                  {docSlots.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No available slots open at this moment.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {docSlots.slice(0, 10).map((s) => (
                        <div
                          key={s.id}
                          className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center space-x-1.5"
                        >
                          <Clock className="w-3 h-3 text-brand-400" />
                          <span>{s.date.slice(5)}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-white font-medium">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
