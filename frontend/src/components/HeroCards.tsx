import React from 'react';

interface HeroCardsProps {
  onStartCall: () => void;
  onScrollToDoctors: () => void;
  onScrollToAppointments: () => void;
}

export const HeroCards: React.FC<HeroCardsProps> = ({
  onStartCall,
  onScrollToDoctors,
  onScrollToAppointments,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Instant Voice Consultation */}
        <div 
          onClick={onStartCall}
          className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-44 bg-[#e8f3fe] relative flex items-center justify-center overflow-hidden p-3">
            <div className="w-24 h-36 bg-black rounded-2xl p-1 shadow-lg border border-zinc-700 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240"
                alt="Doctor on Call" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="absolute top-3 right-3 bg-white/90 text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Voice AI</span>
            </span>
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-bold text-zinc-900 text-sm group-hover:text-sky-600 transition-colors">
              Instant Voice Consultation
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Connect within 60 secs</p>
          </div>
        </div>

        {/* Card 2: Find Doctors Near You */}
        <div 
          onClick={onScrollToDoctors}
          className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-44 bg-[#e8f8f5] relative flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
              alt="Find Doctors" 
              className="h-full w-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-bold text-zinc-900 text-sm group-hover:text-emerald-600 transition-colors">
              Find Doctors Near You
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Confirmed appointments</p>
          </div>
        </div>

        {/* Card 3: Appointments Registry */}
        <div 
          onClick={onScrollToAppointments}
          className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-44 bg-[#f0eefd] relative flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300"
              alt="Appointments Registry" 
              className="h-full w-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-bold text-zinc-900 text-sm group-hover:text-purple-600 transition-colors">
              Appointments Registry
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Live voice-synced bookings</p>
          </div>
        </div>

        {/* Card 4: Top Specialists */}
        <div 
          onClick={onScrollToDoctors}
          className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-44 bg-[#f4f7fb] relative flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300"
              alt="Top Specialists" 
              className="h-full w-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-bold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">
              Clinical Specialists
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Cardiology, Dermatology & more</p>
          </div>
        </div>

      </div>
    </div>
  );
};
