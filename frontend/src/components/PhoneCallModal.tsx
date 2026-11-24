import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Sparkles, 
  Send, Keyboard, Bot, X 
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

  // Auto-dismiss the call screen by itself after call ends
  useEffect(() => {
    if (callState === 'ended') {
      const timer = window.setTimeout(() => {
        onEndCall();
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [callState, onEndCall]);

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
    "Check Dr. Khushi Sharma's availability",
    "I would like to book the 02:00 PM slot",
    "My phone number is 9876543210",
    "Yes, that phone number is correct",
    "I need to cancel my appointment"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Smartphone Chassis Container in Sleek Black & White */}
      <div className="relative w-full max-w-[380px] h-[660px] bg-white rounded-[44px] p-3 shadow-2xl border-[6px] border-black flex flex-col justify-between overflow-hidden">
        
        {/* Phone Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center space-x-1.5 px-2">
            <span className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-white animate-pulse' : 'bg-zinc-400'}`}></span>
            <span className="text-[9px] font-mono font-bold text-white">
              {callState === 'calling' ? 'Calling...' : callState === 'connected' ? formatTimer(callDuration) : 'Ended'}
            </span>
          </div>
        </div>

        {/* Quick Close Button */}
        <button
          onClick={onEndCall}
          className="absolute top-3 right-4 z-40 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all border border-zinc-200 shadow-sm"
          title="Close Modal"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Header Inside Phone */}
        <div className="pt-8 pb-3 px-3 text-center border-b border-zinc-200 bg-zinc-50/80">
          <div className="mx-auto w-13 h-13 rounded-full bg-black p-[2px] shadow-sm mb-2 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-extrabold text-base text-black tracking-tight">Aria • Nexov Care AI</h3>
          <p className="text-xs text-zinc-600 font-semibold">Voice Appointment Specialist</p>

          {/* Call Status pill */}
          <div className="mt-1 flex items-center justify-center space-x-2 text-[11px] text-zinc-500 font-mono font-medium">
            {callState === 'calling' && (
              <span className="text-black font-semibold animate-pulse">Dialing Clinic Line...</span>
            )}
            {callState === 'connected' && (
              <span className="text-black flex items-center space-x-1 font-semibold">
                <span>Voice Connected</span>
                <span>•</span>
                <span>{formatTimer(callDuration)}</span>
              </span>
            )}
            {callState === 'ended' && (
              <span className="text-zinc-500 font-semibold">Call Completed</span>
            )}
          </div>
        </div>

        {/* Middle Screen: Live Reactive Waveform & Conversation Transcript */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 bg-zinc-50/50">
          
          {/* Live Waveform Visualizer */}
          <AudioWaveform 
            isAgentSpeaking={isAgentSpeaking} 
            isCallConnected={callState === 'connected'} 
          />

          {/* Real-time Tool Activity Notification Pill */}
          {toolActivity && (
            <div className="bg-white border border-black/20 text-black px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center space-x-2 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-black flex-shrink-0" />
              <span className="truncate">{toolActivity}</span>
            </div>
          )}

          {/* In-Call Booking Confirmation Card */}
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
                <div className="flex items-center space-x-1 mb-0.5 text-[10px] text-zinc-500 font-medium">
                  <span>{msg.role === 'agent' ? 'Aria (AI)' : 'You (Caller)'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === 'agent' 
                      ? 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-sm shadow-sm' 
                      : 'bg-black text-white rounded-tr-sm shadow-md'
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
            <div className="pt-2 border-t border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                Quick Speech Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-[11px] font-medium bg-white hover:bg-zinc-100 text-black px-2.5 py-1 rounded-lg border border-zinc-200 shadow-sm transition-colors text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Input Drawer */}
        {showKeypad && callState === 'connected' && (
          <form onSubmit={handleSendText} className="px-2 pt-2 border-t border-zinc-200 bg-white flex items-center space-x-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or type message..."
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black font-medium"
            />
            <button
              type="submit"
              className="p-2 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Phone Control Actions */}
        <div className="pt-3 pb-2 px-4 border-t border-zinc-200 bg-white flex items-center justify-around">
          
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            disabled={callState !== 'connected'}
            className={`p-3.5 rounded-full transition-all ${
              isMuted 
                ? 'bg-zinc-200 text-zinc-700 border border-zinc-400' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 shadow-sm'
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-black hover:bg-zinc-800 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
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
                ? 'bg-black text-white' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 shadow-sm'
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
