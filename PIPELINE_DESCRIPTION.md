# Voice AI Pipeline Description (NexovAI Round 1 Assignment)

### Overview
This project is an end-to-end voice AI doctor appointment booking agent built for clinical scheduling with zero-friction caller identification (phone number spoken out loud, no OTP/passwords). It combines Pipecat for conversational orchestration, ElevenLabs for voice synthesis (TTS) and speech recognition (STT), Google Gemini for function calling intelligence, and a custom clinical dashboard built in React + Tailwind CSS.

---

### Pipeline Architecture (Step-by-Step)

1. **Audio Ingestion & Transport (WebRTC / WebSocket)**
   - The user clicks **Try Voice Call** on the frontend, triggering a realistic telephony sequence (dial tone, ringback cadence via Web Audio API).
   - Once connected, browser microphone audio is captured at 16kHz PCM and streamed over a full-duplex WebSocket (`/ws/call`) to the backend.

2. **Voice Activity Detection (VAD) & Speech-to-Text (STT)**
   - Incoming audio frames pass through a VAD analyzer (Silero VAD / frame-level silence gate) to segment user speech from ambient room noise.
   - Speech chunks are passed to **ElevenLabs Speech-to-Text (STT)** to generate clean, real-time transcriptions.

3. **Context Management & Google Gemini LLM**
   - The transcribed text enters the conversational context along with our clinical system instructions.
   - We use **Google Gemini 2.0 Flash** for dialogue reasoning and native function calling. The LLM has three registered tools:
     - `check_doctor_availability(doctor_name, specialty, date)`: queries open slots from the SQLite clinic database.
     - `book_appointment(phone_number, doctor_name, date, time)`: reserves the slot, marks it as booked, and logs the appointment.
     - `cancel_appointment(phone_number)`: finds active bookings by phone and frees the slot back to the schedule.

4. **Conversational Read-Back Confirmation Rule**
   - Per the assignment guidelines, the agent never commits a booking or cancellation blindly.
   - Before executing `book_appointment` or `cancel_appointment`, the LLM verbally reads the phone number back to the caller (e.g. *"Just to confirm, I heard your phone number as 987-654-3210, is that correct?"*).
   - Only when the caller confirms does the agent execute the database write.

5. **Text-to-Speech (TTS) & Real-Time Playback**
   - The agent's conversational response is converted into natural human-like voice using **ElevenLabs Text-to-Speech** (`eleven_turbo_v2_5` / Rachel voice).
   - Audio chunks stream back to the browser via WebSocket, where our `AudioManager` plays them seamlessly through the Web Audio API with zero stutter.

6. **Real-Time Dashboard & Audio Waveform Synchronization**
   - As tool events fire (`booking_confirmed`, `appointment_cancelled`), the server broadcasts structured JSON events to the frontend.
   - The dashboard dynamically highlights the updated appointment row, refreshes open doctor slots, displays an in-call booking confirmation card inside the phone modal, and animates a real-time reactive audio waveform.

---

### Why this design? (FDE Perspective)
- **High reliability**: Includes a fallback mode that lets clients and evaluators test the booking and cancellation flow locally even if API keys have not been configured yet.
- **Pure Python resilience**: Avoided brittle native C-extension dependencies on Windows so the entire system runs out-of-the-box with clean cross-platform compatibility.
- **Top-tier UI/UX**: Avoided generic AI-generated templates; designed a bespoke clinical telemetry dashboard with custom glassmorphic styling, real telephony audio feedback, and full responsive support.
