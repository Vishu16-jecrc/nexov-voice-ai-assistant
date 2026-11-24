"""
Pipecat Voice Pipeline for NexovAI Doctor Appointment Assistant.
Integrates:
- Audio Input via WebSocket Transport
- Silero VAD (Voice Activity Detection)
- ElevenLabs STT (Speech-to-Text)
- Google Gemini LLM with registered Function Calling Tools
- ElevenLabs TTS (Text-to-Speech)
- Audio Output via WebSocket Transport
"""
import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional, List, Callable
from loguru import logger

from .config import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, GEMINI_API_KEY, GEMINI_MODEL
from .tools import check_doctor_availability, book_appointment, cancel_appointment, normalize_phone

SYSTEM_PROMPT = """You are 'Aria', an empathetic, efficient, and professional Voice AI Medical Receptionist at Nexov Care Health Clinic.
Your voice is warm, natural, and concise because you are speaking over a live voice phone call. Keep sentences short and conversational. Avoid markdown, asterisks, bullet points, or lists in your speech—speak in continuous, natural dialogue.

Your Capabilities & Clinical Tools:
1. `check_doctor_availability(doctor_name, specialty, date_str)`: Call this tool when the patient asks about available doctors, open times, or wants to schedule a visit.
2. `book_appointment(phone_number, doctor_name, date_str, time_str, patient_name, notes)`: Call this tool to confirm a booking once all details are verified.
3. `cancel_appointment(phone_number, appointment_id)`: Call this tool to cancel an existing appointment.

CRITICAL CLINICAL & CONVERSATIONAL RULES:
1. CALLER IDENTIFICATION:
   - Identify the caller ONLY by the phone number they speak out loud. No login, password, or OTP is ever needed.
   - If the caller hasn't stated their phone number yet, politely ask: "May I have your phone number please?"
2. NUMBER READ-BACK CONFIRMATION (MANDATORY):
   - Before executing `book_appointment` or `cancel_appointment`, YOU MUST ALWAYS READ THE PHONE NUMBER BACK TO THE CALLER to confirm!
   - PRONOUNCE PHONE NUMBERS STRICTLY AS INDIVIDUAL DIGITS: Always speak each digit one by one, separated by spaces or commas (e.g. "9, 8, 7, 6, 5, 4, 3, 2, 1, 0"). NEVER read a phone number as a large multi-digit number like "nine billion..." or "nine hundred...".
   - Example: "Just to confirm, I have recorded your phone number as 9, 8, 7, 6, 5, 4, 3, 2, 1, 0. Is that phone number correct?"
   - Only call the booking or cancellation tool AFTER the caller confirms their phone number.
3. NATURAL END-TO-END FLOW:
   - Greet the patient warmly: "Thank you for calling Nexov Care Clinic. My name is Aria. How can I help you today?"
   - Inquire about their health concern or preferred doctor/specialty.
   - Offer 2 to 3 clear available slots.
   - Confirm the doctor, date, time, and read back the phone number.
   - When booked, provide a clear, reassuring confirmation.
   - Handle cancellations or checking other doctors smoothly within the same continuous conversation.
"""

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "check_doctor_availability",
            "description": "Returns the available slots for a doctor, specialty, or date so the agent can offer them to the caller.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_name": {"type": "string", "description": "Name of the doctor (e.g. Dr. Khushi Sharma)"},
                    "specialty": {"type": "string", "description": "Medical specialty (e.g. Cardiology, Dermatology)"},
                    "date_str": {"type": "string", "description": "Date requested, e.g., 'today', 'tomorrow', or 'YYYY-MM-DD'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Books a selected slot for the caller, using the phone number the caller told the agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {"type": "string", "description": "The caller's verified phone number"},
                    "doctor_name": {"type": "string", "description": "Full name of the doctor"},
                    "date_str": {"type": "string", "description": "Date of appointment (e.g. 'YYYY-MM-DD', 'today', 'tomorrow')"},
                    "time_str": {"type": "string", "description": "Time of appointment (e.g. '09:00 AM', '10:30 AM')"},
                    "patient_name": {"type": "string", "description": "Caller or patient's name"},
                    "notes": {"type": "string", "description": "Optional notes on symptoms or visit purpose"}
                },
                "required": ["phone_number", "doctor_name", "date_str", "time_str"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_appointment",
            "description": "Cancels the caller's existing appointment, found using the phone number the caller told the agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {"type": "string", "description": "The caller's verified phone number"}
                },
                "required": ["phone_number"]
            }
        }
    }
]

def execute_tool(tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatches tool execution to the verified clinical backend functions."""
    logger.info(f"Executing tool '{tool_name}' with arguments: {args}")
    if tool_name == "check_doctor_availability":
        return check_doctor_availability(
            doctor_name=args.get("doctor_name"),
            specialty=args.get("specialty"),
            date_str=args.get("date_str")
        )
    elif tool_name == "book_appointment":
        return book_appointment(
            phone_number=args.get("phone_number", ""),
            doctor_name=args.get("doctor_name", ""),
            date_str=args.get("date_str", ""),
            time_str=args.get("time_str", ""),
            patient_name=args.get("patient_name", "Patient"),
            notes=args.get("notes", "")
        )
    elif tool_name == "cancel_appointment":
        return cancel_appointment(
            phone_number=args.get("phone_number", "")
        )
    return {"status": "error", "message": f"Unknown tool: {tool_name}"}
