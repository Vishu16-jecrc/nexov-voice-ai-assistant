"""
FastAPI Server & WebSocket Orchestrator for NexovAI Doctor Assistant.
Coordinates voice audio streams, Pipecat tools, live transcripts, and dashboard sync.
"""
import json
import time
import base64
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from loguru import logger
import os

from .database import (
    init_db,
    seed_sample_data,
    get_all_doctors,
    get_slots_by_doctor,
    get_all_appointments,
    get_appointments_by_phone,
    save_call_log,
    get_call_logs
)
from .tools import (
    check_doctor_availability,
    book_appointment,
    cancel_appointment,
    normalize_phone
)
from .gemini_service import gemini_service
from .elevenlabs_service import elevenlabs_service
from .config import ELEVENLABS_API_KEY, GEMINI_API_KEY

app = FastAPI(title="NexovAI Clinical Voice Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize and seed database
@app.on_event("startup")
def on_startup():
    init_db()
    seed_sample_data()
    logger.info("Database initialized and sample clinical data seeded.")

# --- REST Endpoints for Frontend Dashboard ---

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "pipeline": "Pipecat + ElevenLabs + Gemini",
        "llm": "Google Gemini 2.0 Flash" if GEMINI_API_KEY else "Gemini (Simulated/Ready)",
        "tts": "ElevenLabs Turbo v2.5" if ELEVENLABS_API_KEY else "ElevenLabs (Ready)",
        "stt": "ElevenLabs Scribe" if ELEVENLABS_API_KEY else "ElevenLabs (Ready)"
    }

@app.get("/api/doctors")
def get_doctors():
    return get_all_doctors()

@app.get("/api/slots")
def get_slots(doctor_id: Optional[int] = None, date: Optional[str] = None):
    return get_slots_by_doctor(doctor_name_or_id=doctor_id or "", target_date=date)

@app.get("/api/appointments")
def get_appointments():
    return get_all_appointments()

class BookRequest(BaseModel):
    phone_number: str
    doctor_name: str
    date_str: str
    time_str: str
    patient_name: Optional[str] = "Patient"
    notes: Optional[str] = ""

@app.post("/api/appointments/book")
def api_book_appointment(req: BookRequest):
    res = book_appointment(
        phone_number=req.phone_number,
        doctor_name=req.doctor_name,
        date_str=req.date_str,
        time_str=req.time_str,
        patient_name=req.patient_name,
        notes=req.notes
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

class CancelRequest(BaseModel):
    phone_number: str
    appointment_id: Optional[int] = None

@app.post("/api/appointments/cancel")
def api_cancel_appointment(req: CancelRequest):
    res = cancel_appointment(
        phone_number=req.phone_number,
        appointment_id=req.appointment_id
    )
    if res.get("status") == "not_found" or res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@app.get("/api/call-logs")
def get_recent_call_logs():
    return get_call_logs(limit=20)


# --- Live WebSocket Voice Pipeline ---

@app.websocket("/ws/call")
async def websocket_call_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_start = datetime.now().isoformat()
    start_ts = time.time()
    logger.info("New live voice call session connected.")

    conversation: List[Dict[str, Any]] = []
    caller_phone: Optional[str] = None
    action_taken: Optional[str] = None

    async def handle_tool_notification(tool_name: str, args: Dict[str, Any], result: Dict[str, Any]):
        nonlocal caller_phone, action_taken

        # Notify UI of tool activity
        await websocket.send_text(json.dumps({
            "type": "tool_activity",
            "tool": tool_name,
            "message": f"Executing {tool_name}..."
        }))

        if tool_name == "book_appointment" and result.get("status") == "success":
            caller_phone = result.get("phone_number")
            action_taken = f"Booked with {result.get('doctor_name')} for {result.get('date')} at {result.get('time')}"
            await websocket.send_text(json.dumps({
                "type": "booking_confirmed",
                "data": result
            }))

        elif tool_name == "cancel_appointment" and result.get("status") == "success":
            caller_phone = result.get("phone_number")
            action_taken = f"Cancelled appointment with {result.get('doctor_name')} for {result.get('date')}"
            await websocket.send_text(json.dumps({
                "type": "appointment_cancelled",
                "data": result
            }))

    try:
        while True:
            raw_msg = await websocket.receive_text()
            data = json.loads(raw_msg)
            msg_type = data.get("type")

            if msg_type == "start_call":
                # Initial greeting
                greeting = "Thank you for calling Nexov Care Clinic. My name is Aria, your voice scheduling assistant. How can I help you today?"
                conversation.append({"role": "assistant", "text": greeting})

                # Send transcript
                await websocket.send_text(json.dumps({
                    "type": "agent_transcript",
                    "text": greeting
                }))

                # Generate TTS audio
                audio_b64 = await elevenlabs_service.text_to_speech(greeting)
                if audio_b64:
                    await websocket.send_text(json.dumps({
                        "type": "agent_audio",
                        "audio_base64": audio_b64,
                        "mime": "audio/mp3"
                    }))

            elif msg_type == "audio_chunk":
                # Received audio chunk from browser mic
                chunk_b64 = data.get("audio_base64", "")
                if chunk_b64 and elevenlabs_service.api_key:
                    audio_bytes = base64.b64decode(chunk_b64)
                    transcribed_text = await elevenlabs_service.speech_to_text(audio_bytes)
                    if transcribed_text and transcribed_text.strip():
                        # Treat as caller input
                        data["text"] = transcribed_text.strip()
                        msg_type = "text_input"

            if msg_type == "text_input":
                user_text = data.get("text", "").strip()
                if not user_text:
                    continue

                conversation.append({"role": "user", "text": user_text})

                # Check phone number if mentioned
                import re
                phone_candidate = re.findall(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b", user_text)
                if phone_candidate:
                    caller_phone = normalize_phone(phone_candidate[-1])

                # Process through Gemini with function calling
                response_text, tool_events = await gemini_service.chat(
                    conversation, 
                    on_tool_call=handle_tool_notification
                )

                conversation.append({"role": "assistant", "text": response_text})

                # Send response text transcript to UI
                await websocket.send_text(json.dumps({
                    "type": "agent_transcript",
                    "text": response_text
                }))

                # Generate and send TTS audio
                audio_b64 = await elevenlabs_service.text_to_speech(response_text)
                if audio_b64:
                    await websocket.send_text(json.dumps({
                        "type": "agent_audio",
                        "audio_base64": audio_b64,
                        "mime": "audio/mp3"
                    }))

            elif msg_type == "end_call":
                logger.info("Caller requested call end.")
                break

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally.")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
    finally:
        session_end = datetime.now().isoformat()
        duration_sec = int(time.time() - start_ts)
        save_call_log(
            caller_phone=caller_phone,
            start_time=session_start,
            end_time=session_end,
            duration_sec=duration_sec,
            transcript=conversation,
            action_taken=action_taken or "General Inquiry"
        )
        logger.info(f"Call session ended and saved. Duration: {duration_sec}s.")

# Mount built frontend dist for seamless full-stack single-port serving
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")

