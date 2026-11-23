import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Sparkles, 
  Send, Keyboard, Bot 
} from 'lucide-react';
import { CallState, TranscriptMessage, BookingConfirmation } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { BookingConfirmCard } from './BookingConfirmCard';
import { audioManager } from '../services/audioManager';

interface PhoneCallModalProps {
  isOpen: boolean;
  callState: CallState;
  onEndCall: () => void;
  transcript: TranscriptMessage[];
  onSendMessage: (text: string) => void;
  bookingConfirmation: BookingConfirmation | null;
  isAgentSpeaking: boolean;
  toolActivity: string | null;
}

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  isOpen,
  callState,
  onEndCall,
  transcript,
  onSendMessage,
  bookingConfirmation,
  isAgentSpeaking,
  toolActivity
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputText, setInputText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);

  // Call timer
  useEffect(() => {
    let timer: number;
    if (callState === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, toolActivity, bookingConfirmation]);

  if (!isOpen && callState === 'idle') return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    "Check Dr. Sarah Jenkins' availability",
    "I would like to book the 09:00 AM slot",
    "My phone number is 9876543210",
    "Yes, that phone number is correct",
    "I need to cancel my appointment"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Smartphone Chassis Container */}
      <div className="relative w-full max-w-[380px] h-[660px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[5px] border-slate-700/80 flex flex-col justify-between overflow-hidden">
        
        {/* Phone Speaker & Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-24 h-4 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center space-x-1.5 px-2">
            <span className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[9px] font-mono font-medium text-slate-300">
              {callState === 'calling' ? 'Calling...' : callState === 'connected' ? formatTimer(callDuration) : 'Call Ended'}
            </span>
          </div>
        </div>

        {/* Top Header Inside Phone */}
        <div className="pt-8 pb-2 px-3 text-center border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-transparent">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-teal-400 p-[2px] shadow-lg mb-2">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Bot className="w-7 h-7 text-brand-300" />
            </div>
          </div>
          <h3 className="font-bold text-base text-white tracking-tight">Aria • Nexov Care AI</h3>
          <p className="text-xs text-brand-400 font-medium">Voice Appointment Specialist</p>

          {/* Call Status pill */}
          <div className="mt-1 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
            {callState === 'calling' && (
              <span className="text-amber-400 animate-pulse">Dialing Clinic Trunk Line...</span>
            )}
            {callState === 'connected' && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <span>HD Voice Connected</span>
                <span>•</span>
                <span>{formatTimer(callDuration)}</span>
              </span>
            )}
            {callState === 'ended' && (
              <span className="text-rose-400">Call Completed</span>
            )}
          </div>
        </div>

        {/* Middle Screen: Live Reactive Waveform & Conversation Transcript */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Live Waveform Visualizer */}
          <AudioWaveform 
            isAgentSpeaking={isAgentSpeaking} 
            isCallConnected={callState === 'connected'} 
          />

          {/* Real-time Tool Activity Notification Pill */}
          {toolActivity && (
            <div className="bg-brand-950/60 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-xl text-[11px] flex items-center space-x-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
              <span className="truncate">{toolActivity}</span>
            </div>
          )}

          {/* In-Call Booking Confirmation Card (Bonus) */}
          {bookingConfirmation && (
            <BookingConfirmCard confirmation={bookingConfirmation} />
          )}

          {/* Transcript Messages inside Phone */}
          <div className="space-y-2 pt-1">
            {transcript.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col text-xs ${
                  msg.role === 'agent' ? 'items-start' : 'items-end'
                }`}
              >
                <div className="flex items-center space-x-1 mb-0.5 text-[10px] text-slate-400">
                  <span>{msg.role === 'agent' ? 'Aria (AI)' : 'You (Caller)'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === 'agent' 
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm' 
                      : 'bg-brand-600 text-white rounded-tr-sm shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={transcriptBottomRef} />
          </div>

          {/* Quick Voice Simulation Chips */}
          {callState === 'connected' && (
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
                Quick Speech Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-[11px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Input Drawer (Optional Fallback) */}
        {showKeypad && callState === 'connected' && (
          <form onSubmit={handleSendText} className="px-2 pt-2 border-t border-slate-800/80 bg-slate-950 flex items-center space-x-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or type message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Phone Control Actions */}
        <div className="pt-3 pb-2 px-4 border-t border-slate-800/60 bg-gradient-to-t from-slate-900/80 to-transparent flex items-center justify-around">
          
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            disabled={callState !== 'connected'}
            className={`p-3.5 rounded-full transition-all ${
              isMuted 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Keyboard / Text Toggle */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            disabled={callState !== 'connected'}
            className={`p-3.5 rounded-full transition-all ${
              showKeypad 
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Toggle Text Input"
          >
            <Keyboard className="w-5 h-5" />
          </button>

        </div>

      </div>
    </div>
  );
};
