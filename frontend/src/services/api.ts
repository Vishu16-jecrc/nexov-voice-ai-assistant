import { Doctor, Appointment, Slot } from '../types';

const API_BASE = '/api';

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API_BASE}/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function fetchDoctorSlots(doctorId?: number, date?: string): Promise<Slot[]> {
  const params = new URLSearchParams();
  if (doctorId) params.append('doctor_id', doctorId.toString());
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/slots?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function fetchSystemHealth(): Promise<{ status: string; pipeline: string; llm: string; tts: string; stt: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'offline', pipeline: 'Disconnected', llm: 'Gemini', tts: 'ElevenLabs', stt: 'ElevenLabs' };
    return res.json();
  } catch {
    return { status: 'offline', pipeline: 'Disconnected', llm: 'Gemini', tts: 'ElevenLabs', stt: 'ElevenLabs' };
  }
}
