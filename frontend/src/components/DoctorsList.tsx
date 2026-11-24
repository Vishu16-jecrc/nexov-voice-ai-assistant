import React, { useState } from 'react';
import { Doctor, Slot } from '../types';
import { Clock, ThumbsUp, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface DoctorsListProps {
  doctors: Doctor[];
  slots: Slot[];
  searchTerm?: string;
  onSelectSlot?: (doctorName: string, date: string, time: string) => void;
  onBookVoice?: () => void;
}

export const DoctorsList: React.FC<DoctorsListProps> = ({ 
  doctors, 
  slots, 
  searchTerm = '', 
  onBookVoice 
}) => {
  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedDoctorId(expandedDoctorId === id ? null : id);
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-10">
      
      {/* Practo-style Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-2xl font-bold text-[#1c2b53] tracking-tight">
            Consult top doctors online for any health concern
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Private consultations with verified doctors in all specialities
          </p>
        </div>
        
        <button 
          onClick={onBookVoice}
          className="mt-3 sm:mt-0 text-xs font-bold text-sky-600 hover:text-sky-700 border border-sky-400 px-4 py-2 rounded-lg hover:bg-sky-50 transition-colors"
        >
          Book via Voice AI
        </button>
      </div>

      {/* Doctor Cards Listing */}
      <div className="space-y-4">
        {filteredDoctors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-sm">
            No doctors found matching "{searchTerm}". Try searching "Cardiology" or "Sarah".
          </div>
        ) : (
          filteredDoctors.map((doc) => {
            const docSlots = slots.filter(s => s.doctor_id === doc.id && !s.is_booked);
            const isExpanded = expandedDoctorId === doc.id;

            return (
              <div 
                key={doc.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                {/* Left: Doctor Photo & Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="relative">
                    <img 
                      src={doc.avatar} 
                      alt={doc.name} 
                      className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-[#1c2b53] hover:text-sky-600 cursor-pointer transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">{doc.specialty}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">12+ years experience overall</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mt-2 font-medium">
                      <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        <ThumbsUp className="w-3 h-3" />
                        <span>98%</span>
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{doc.room_number} • Nexov Clinic</span>
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-700 font-bold">{doc.consultation_fee} fee</span>
                    </div>

                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>
                </div>

                {/* Right: Availability & Action Buttons */}
                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 min-w-[200px]">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Available Today • {docSlots.length} Open Slots</span>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleExpand(doc.id)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-zinc-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Slots' : 'View Available Slots'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={onBookVoice}
                      className="text-xs font-bold px-4 py-2 rounded-lg bg-[#1c2b53] hover:bg-[#28328c] text-white transition-colors flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <span>Book with Voice AI</span>
                    </button>
                  </div>
                </div>

                {/* Slot Details Dropdown */}
                {isExpanded && (
                  <div className="w-full basis-full mt-4 pt-4 border-t border-zinc-200">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">
                      Live Open Slots:
                    </span>
                    {docSlots.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">No slots available right now.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {docSlots.slice(0, 10).map((s) => (
                          <div 
                            key={s.id}
                            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 flex items-center space-x-2 font-medium"
                          >
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>{s.date.slice(5)}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="font-bold text-black">{s.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
