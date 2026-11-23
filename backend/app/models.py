"""
Data models and schemas for NexovAI Doctor Appointment Assistant.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Doctor(BaseModel):
    id: int
    name: str
    specialty: str
    bio: str
    avatar: str
    rating: float = 4.9
    consultation_fee: str = "$75"
    room_number: str = "Suite 302"

class Slot(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    date: str
    time: str
    is_booked: bool = False
    booked_by_phone: Optional[str] = None

class Appointment(BaseModel):
    id: int
    patient_name: str
    phone_number: str
    doctor_id: int
    doctor_name: str
    specialty: str
    appointment_date: str
    appointment_time: str
    status: str = "confirmed"  # confirmed, cancelled, completed
    notes: Optional[str] = ""
    created_at: str
    updated_at: Optional[str] = None

class CallLog(BaseModel):
    id: int
    caller_phone: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    duration_seconds: int = 0
    transcript: List[Dict[str, Any]] = []
    action_taken: Optional[str] = None
    status: str = "completed"

class CheckAvailabilityRequest(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    date: Optional[str] = None

class BookAppointmentRequest(BaseModel):
    phone_number: str
    doctor_name: str
    date: str
    time: str
    patient_name: Optional[str] = "Patient"
    notes: Optional[str] = ""

class CancelAppointmentRequest(BaseModel):
    phone_number: str
    appointment_id: Optional[int] = None
