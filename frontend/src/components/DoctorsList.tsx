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
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-black tracking-tight">Clinic Medical Staff</h2>
          <p className="text-xs text-zinc-500">Board-certified doctors with live schedule availability</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
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
              className="bg-zinc-50/70 border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 transition-all duration-200"
            >
              <div className="flex items-start space-x-3.5">
                <img 
                  src={doc.avatar} 
                  alt={doc.name} 
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shadow-sm filter grayscale contrast-110"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-black truncate">{doc.name}</h3>
                    <div className="flex items-center space-x-1 text-black text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span className="font-mono">{doc.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 font-semibold mt-0.5">{doc.specialty}</p>

                  <div className="flex items-center space-x-3 text-[11px] text-zinc-500 mt-2 font-medium">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span>{doc.room_number}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-zinc-400" />
                      <span>{doc.consultation_fee}</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-600 mt-3 line-clamp-2 leading-relaxed">
                {doc.bio}
              </p>

              {/* Slots Expand Toggle */}
              <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] text-zinc-600 flex items-center space-x-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  <span><strong className="text-black font-mono">{docSlots.length}</strong> open slots</span>
                </span>

                <button
                  onClick={() => toggleExpand(doc.id)}
                  className="text-xs font-semibold text-black hover:text-zinc-600 flex items-center space-x-1 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Schedule' : 'View Open Slots'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Open Slots list */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-zinc-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  {docSlots.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No available slots open at this moment.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {docSlots.slice(0, 10).map((s) => (
                        <div
                          key={s.id}
                          className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-800 flex items-center space-x-1.5 shadow-sm"
                        >
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{s.date.slice(5)}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-black font-semibold">{s.time}</span>
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
