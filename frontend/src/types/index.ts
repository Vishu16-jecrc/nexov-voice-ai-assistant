export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  rating: number;
  consultation_fee: string;
  room_number: string;
}

export interface Slot {
  id: number;
  doctor_id: number;
  doctor_name: string;
  date: string;
  time: string;
  is_booked: boolean | number;
  booked_by_phone?: string | null;
}

export interface Appointment {
  id: number;
  patient_name: string;
  phone_number: string;
  doctor_id: number;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type CallState = 'idle' | 'calling' | 'connected' | 'ended';

export interface TranscriptMessage {
  id: string;
  role: 'agent' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export interface BookingConfirmation {
  appointment_id: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  phone_number: string;
  room_number?: string;
}

export interface ClinicStats {
  totalDoctors: number;
  openSlotsToday: number;
  confirmedAppointments: number;
  pipelineStatus: 'ready' | 'active' | 'offline';
}
