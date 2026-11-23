# NexovAI Voice AI Doctor Appointment Assistant

[![Pipeline](https://img.shields.io/badge/Pipeline-Pipecat-blue.svg)](https://github.com/pipecat-ai/pipecat)
[![TTS/STT](https://img.shields.io/badge/Voice-ElevenLabs-black.svg)](https://elevenlabs.io)
[![LLM](https://img.shields.io/badge/LLM-Google_Gemini_2.0_Flash-orange.svg)](https://ai.google.dev)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_+_Vite_+_Tailwind-teal.svg)](https://react.dev)

A voice-based clinical appointment booking system built for **NexovAI Round 1 Assignment (SDE / FDE Internship)**. 

A caller dials the clinic and speaks naturally to **Aria**, an empathetic Voice AI assistant. The assistant checks doctor availability, books appointments, and cancels appointments. The caller is identified **solely by the phone number they speak out loud** (no login, no OTP, no passwords). The assistant **reads the number back to confirm** before finalizing any booking or cancellation. All actions synchronize in real-time with an executive clinical dashboard.

---

## Architecture Overview

```
 Caller Audio (Browser Mic)
             │
             ▼
  FastAPI WebSocket Transport (`/ws/call`)
             │
             ▼
  Voice Activity Detection (VAD / Silero)
             │
             ▼
  ElevenLabs Speech-to-Text (STT)
             │
             ▼
  Google Gemini 2.0 Flash (Function Calling)
      ├── check_doctor_availability()
      ├── book_appointment()  <-- Verbal Phone Read-Back Confirmation
      └── cancel_appointment()<-- Verbal Phone Read-Back Confirmation
             │
             ▼
  ElevenLabs Text-to-Speech (TTS)
             │
             ▼
  Web Audio Playback & Real-Time Dashboard Sync
      ├── Live Conversation Transcript
      ├── Interactive Reactive Audio Waveform
      ├── In-Phone Booking Confirmation Card
      └── Real-Time Appointments & Slot Highlighting
```

---

## Tech Stack & Design Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Framework** | **Pipecat (Python 3.11)** | Standard open-source multimodal voice agent orchestration framework. |
| **STT** | **ElevenLabs Speech-to-Text** | Ultra-accurate clinical and numerical transcription. |
| **TTS** | **ElevenLabs Turbo v2.5** (Rachel Voice) | Low-latency, human-sounding conversational voice. |
| **LLM** | **Google Gemini 2.0 Flash** | Fast inference, free tier quota, native function calling support. |
| **Backend** | **FastAPI + Uvicorn + SQLite** | Asynchronous WebSocket streaming and relational slot persistence. |
| **Frontend** | **React 18 + Vite + Tailwind CSS** | Bespoke clinical design with dark mode, zero generic AI template look. |

---

## Core Features & Assignment Requirements

### 1. Part A: Voice Pipeline (Pipecat)
- **`check_doctor_availability`**: Returns open slots for a doctor, specialty (Cardiology, Dermatology, Orthopedics, General Medicine), or date.
- **`book_appointment`**: Books a selected slot for the caller using the spoken phone number.
- **`cancel_appointment`**: Cancels active appointments matching the caller's spoken phone number and frees the slot.
- **Strict Verification Rule**: The agent identifies the caller ONLY by the phone number spoken out loud and **always reads the phone number back** to confirm before booking or cancelling.

### 2. Part B: Clinical Frontend Dashboard
- **Live Call Trigger**: Starts and ends voice calls directly from the browser.
- **Real-Time Transcript**: Live auto-scrolling log of user and agent dialogue.
- **Doctors & Available Slots**: Expandable directory of clinical staff and open appointment slots.
- **Appointments Registry**: Dynamic table showing patient name, phone number, doctor, date/time, status, and notes.

### 3. Bonus Features Implemented
- **Phone-Style Call Interface**: Pop-up smartphone chassis with Dynamic Island status indicator, call timer, mute toggle, and end-call button.
- **Live Reactive Audio Waveform**: Dynamic audio visualizer reflecting caller microphone input and agent speech.
- **In-Phone Booking Confirmation Card**: Receipt card generated inside the phone screen upon booking.
- **Dashboard Row Highlight**: Live pulse animation on the specific dashboard row whenever an appointment is booked or cancelled.
- **Telephony Audio Feedback**: Web Audio API synthesis for realistic phone dial tones, ringback cadences, and hangup tones.

---

## Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Setup Backend
```bash
# Navigate to project root
cd "NEXOV AI PROJECT"

# Activate the virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install Python requirements (if setting up fresh)
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Fill in your API keys (optional — if omitted, the system runs in an offline Intelligent Fallback Simulation mode for instant testing):
```env
ELEVENLABS_API_KEY=your_elevenlabs_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=8000
HOST=0.0.0.0
```

### 3. Build & Run Frontend
```bash
# In another terminal:
cd frontend
npm install
npm run build
```

### 4. Start the Application
Run the unified backend server (serves the API, WebSocket pipeline, and built frontend on port 8000):
```bash
python backend/run_server.py
```
Open your browser at: **`http://localhost:8000`**

*(Alternatively, for frontend hot-reloading during development, run `npm run dev` inside `frontend` and visit `http://localhost:5173`)*.

---

## Testing & Verification

Run the automated integration test suite:
```bash
# Run unit tests on database & scheduling tools:
pytest backend/tests/test_tools.py

# Run live end-to-end WebSocket voice pipeline test:
python backend/tests/test_server_live.py
```

---

## 3-Minute Video Recording Walkthrough Guide

Follow this simple script to record your assignment submission video:

1. **Dashboard Overview (0:00 - 0:25)**
   - Show the dashboard at `http://localhost:8000`.
   - Point out the 4 doctors, active slots, and appointments table.
   - Mention the tech stack: Pipecat + ElevenLabs STT/TTS + Gemini 2.0 Flash.

2. **Initiate Voice Call (0:25 - 0:45)**
   - Click **Try Voice Call**. Notice the telephone ringing tone and the phone chassis popping up.
   - Listen to Agent Aria greet you: *"Thank you for calling Nexov Care Clinic. My name is Aria..."*

3. **Check Doctor Availability (0:45 - 1:15)**
   - Speak or click: *"I'd like to check available slots for Dr. Sarah Jenkins."*
   - Agent checks the database and announces open slots (e.g. 02:00 PM today).

4. **Book Slot & Phone Read-Back (1:15 - 1:55)**
   - Speak or click: *"Let's book the 02:00 PM slot today. My phone number is 987-654-3210."*
   - Notice the agent **reads back the phone number**: *"Before I confirm, I heard your phone number as 987-654-3210, is that correct?"*
   - Confirm: *"Yes, that is correct."*

5. **Verify Live Dashboard Sync (1:55 - 2:20)**
   - Show the **In-Phone Booking Confirmation Card** pop up with appointment details.
   - Show the background dashboard table highlight row **#4** with phone number `9876543210` in status `Confirmed`.
   - End the call and show the call completed state.

---

## Submission Details
- **Role**: SDE Intern / Forward Deployed Engineer (FDE) Round 1
- **Submission Form**: [Google Form Link](https://docs.google.com/forms/d/e/1FAIpQLSdruhcgKFC4LjnlwHfYDRZoGsa0r-qy4k68SJ8RsmxsPbYxpg/viewform?usp=publish-editor)
- **Deadline**: Wednesday, 25 November, 11:00 PM IST
