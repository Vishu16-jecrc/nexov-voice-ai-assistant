import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { DoctorsList } from './components/DoctorsList';
import { AppointmentsTable } from './components/AppointmentsTable';
import { PhoneCallModal } from './components/PhoneCallModal';
import { Doctor, Slot, Appointment, CallState, TranscriptMessage, BookingConfirmation, ClinicStats } from './types';
import { fetchDoctors, fetchDoctorSlots, fetchAppointments, fetchSystemHealth } from './services/api';
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
  const [pipelineHealth, setPipelineHealth] = useState({
    pipeline: 'Pipecat',
    llm: 'Gemini 2.0 Flash',
    tts: 'ElevenLabs Turbo',
    stt: 'ElevenLabs Scribe'
  });

  // Load initial clinic data
  const loadData = async () => {
    try {
      const [docs, slts, apts, health] = await Promise.all([
        fetchDoctors(),
        fetchDoctorSlots(),
        fetchAppointments(),
        fetchSystemHealth()
      ]);
      setDoctors(docs);
      setSlots(slts);
      setAppointments(apts);
      setPipelineHealth(health);
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
        }
      } else if (event.type === 'agent_transcript') {
        setTranscript(prev => [...prev, event.message]);
      } else if (event.type === 'user_transcript') {
        setTranscript(prev => [...prev, event.message]);
      } else if (event.type === 'agent_speaking') {
        setIsAgentSpeaking(event.isSpeaking);
      } else if (event.type === 'tool_activity') {
        setToolActivity(`${event.tool}: ${event.message}`);
        setTimeout(() => setToolActivity(null), 3500);
      } else if (event.type === 'booking_confirmed') {
        setBookingConfirmation(event.data);
        setHighlightedAptId(event.data.appointment_id);
        // Refresh clinic data to reflect newly booked slot
        loadData();
        setTimeout(() => setHighlightedAptId(null), 5000);
      } else if (event.type === 'appointment_cancelled') {
        setHighlightedAptId(event.data.appointment_id);
        // Refresh clinic data to reflect freed slot and cancelled appointment
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
  };

  const handleSendMessage = (text: string) => {
    voiceClient.sendTextMessage(text);
  };

  // Compute live stats
  const stats: ClinicStats = {
    totalDoctors: doctors.length,
    openSlotsToday: slots.filter(s => !s.is_booked).length,
    confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
    pipelineStatus: 'ready'
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header 
        onStartCall={handleStartCall}
        isCallActive={callState === 'calling' || callState === 'connected'}
        pipelineHealth={pipelineHealth}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Overview Cards */}
        <StatsOverview stats={stats} />

        {/* Doctors Grid with Available Slots */}
        <DoctorsList 
          doctors={doctors} 
          slots={slots} 
        />

        {/* Real-time Appointments Registry */}
        <AppointmentsTable 
          appointments={appointments}
          highlightedAptId={highlightedAptId}
        />

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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 NexovAI Clinical Systems • Built with Pipecat, ElevenLabs & Google Gemini</p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>FDE Assignment Round 1</span>
            <span>•</span>
            <span className="font-mono text-brand-400">Caller ID: Spoken Phone Number Only</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
