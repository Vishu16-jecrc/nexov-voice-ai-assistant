import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { HeroCards } from './components/HeroCards';
import { DoctorsList } from './components/DoctorsList';
import { AppointmentsTable } from './components/AppointmentsTable';
import { PhoneCallModal } from './components/PhoneCallModal';
import { Doctor, Slot, Appointment, CallState, TranscriptMessage, BookingConfirmation } from './types';
import { fetchDoctors, fetchDoctorSlots, fetchAppointments } from './services/api';
import { voiceClient } from './services/voiceClient';

export const App: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callState, setCallState] = useState<CallState>('idle');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [toolActivity, setToolActivity] = useState<string | null>(null);
  const [highlightedAptId, setHighlightedAptId] = useState<number | null>(null);
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('nexov_user_phone') || '';
  });

  const handleUpdateUserPhone = (phone: string) => {
    setUserPhone(phone);
    if (phone) {
      localStorage.setItem('nexov_user_phone', phone);
    } else {
      localStorage.removeItem('nexov_user_phone');
    }
  };

  // Search & Location
  const [location, setLocation] = useState('New Delhi');
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for scrolling
  const doctorsRef = useRef<HTMLDivElement | null>(null);
  const appointmentsRef = useRef<HTMLDivElement | null>(null);

  const scrollToDoctors = () => {
    doctorsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAppointments = () => {
    appointmentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial clinic data
  const loadData = async () => {
    try {
      const [docs, slts, apts] = await Promise.all([
        fetchDoctors(),
        fetchDoctorSlots(),
        fetchAppointments()
      ]);
      setDoctors(docs);
      setSlots(slts);
      setAppointments(apts);
    } catch (err) {
      console.warn("Error loading clinic data:", err);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to voice client events
    const unsubscribe = voiceClient.subscribe((event) => {
      if (event.type === 'state_change') {
        setCallState(event.state);
        if (event.state === 'calling') {
          setTranscript([]);
          setBookingConfirmation(null);
          setToolActivity(null);
        } else if (event.state === 'ended') {
          // Auto-dismiss the call screen by itself after call finishes
          window.setTimeout(() => {
            setCallState('idle');
            scrollToAppointments();
          }, 1000);
        }
      } else if (event.type === 'agent_transcript') {
        setTranscript(prev => [...prev, event.message]);
      } else if (event.type === 'user_transcript') {
        setTranscript(prev => [...prev, event.message]);
        // Auto-extract 10 digit phone number if caller stated it
        const digits = event.message.text.replace(/\D/g, '');
        if (digits.length === 10) {
          handleUpdateUserPhone(digits);
        }
      } else if (event.type === 'agent_speaking') {
        setIsAgentSpeaking(event.isSpeaking);
      } else if (event.type === 'tool_activity') {
        setToolActivity(`${event.tool}: ${event.message}`);
        setTimeout(() => setToolActivity(null), 3500);
      } else if (event.type === 'booking_confirmed') {
        setBookingConfirmation(event.data);
        setHighlightedAptId(event.data.appointment_id);
        if (event.data.phone_number) {
          handleUpdateUserPhone(event.data.phone_number);
        }
        loadData();
        setTimeout(() => setHighlightedAptId(null), 5000);
      } else if (event.type === 'appointment_cancelled') {
        setHighlightedAptId(event.data.appointment_id);
        if (event.data.phone_number) {
          handleUpdateUserPhone(event.data.phone_number);
        }
        loadData();
        setTimeout(() => setHighlightedAptId(null), 5000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartCall = () => {
    voiceClient.startCall();
  };

  const handleEndCall = () => {
    voiceClient.endCall();
    // Auto-dismiss call modal and scroll to appointments
    window.setTimeout(() => {
      setCallState('idle');
      scrollToAppointments();
    }, 900);
  };

  const handleSendMessage = (text: string) => {
    voiceClient.sendTextMessage(text);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-zinc-900 flex flex-col font-sans">
      
      {/* Practo-style Header */}
      <Header 
        onStartCall={handleStartCall}
        isCallActive={callState === 'calling' || callState === 'connected'}
        onScrollToDoctors={scrollToDoctors}
        onScrollToAppointments={scrollToAppointments}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pb-16">
        
        {/* Dual Search & Location Bar */}
        <HeroSearch 
          location={location}
          setLocation={setLocation}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* 4 Iconic Practo Feature Cards */}
        <HeroCards 
          onStartCall={handleStartCall}
          onScrollToDoctors={scrollToDoctors}
          onScrollToAppointments={scrollToAppointments}
        />

        {/* Doctor Consultation Directory */}
        <div ref={doctorsRef}>
          <DoctorsList 
            doctors={doctors} 
            slots={slots} 
            searchTerm={searchTerm}
            onBookVoice={handleStartCall}
          />
        </div>

        {/* Real-time Appointments Registry */}
        <div ref={appointmentsRef}>
          <AppointmentsTable 
            appointments={appointments}
            highlightedAptId={highlightedAptId}
            userPhone={userPhone}
            onUpdateUserPhone={handleUpdateUserPhone}
            onStartCall={handleStartCall}
          />
        </div>

      </main>

      {/* Phone-Style Call Interface (Bonus Modal) */}
      <PhoneCallModal
        isOpen={callState !== 'idle'}
        callState={callState}
        onEndCall={handleEndCall}
        transcript={transcript}
        onSendMessage={handleSendMessage}
        bookingConfirmation={bookingConfirmation}
        isAgentSpeaking={isAgentSpeaking}
        toolActivity={toolActivity}
      />

      {/* Practo-style Clean Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1 font-bold text-sm text-[#1c2b53]">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>nexov</span>
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span className="text-zinc-400 font-normal ml-2 text-xs">© 2026 NexovAI Clinical Systems</span>
          </div>
          <div className="flex items-center space-x-4 text-zinc-500 font-medium">
            <span>Find Doctors</span>
            <span>•</span>
            <span>Voice Consultation</span>
            <span>•</span>
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span className="text-[#1c2b53] font-bold">Caller ID: Spoken Phone Number Only</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
