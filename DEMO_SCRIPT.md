# NexovAI Voice AI Doctor Appointment Assistant
## 🎥 3-Minute Demo Video Recording Script

> **Target Duration:** 2 minutes to 2 minutes 30 seconds (Hard limit: 3 minutes)  
> **Tool for Recording:** Windows Game Bar (`Win + G`), Loom, or OBS Studio  
> **URL:** `http://localhost:8000`  
> **Demo Account:** `9876543210` / `password123` (Caller: **Vishu Patel**)

---

### ⏱️ Video Timeline at a Glance
| Time | Scene | Action | What to Say / Show |
|---|---|---|---|
| **0:00 - 0:25** | Intro & Dashboard | Screen on `http://localhost:8000` | Introduce the Practo-style appointment system, verified doctors, and seeded past visits. |
| **0:25 - 0:45** | Start Voice Call | Click **"Instant Voice Call"** | Show phone chassis modal, realistic ringback, and Aria introducing herself. |
| **0:45 - 1:10** | Check Availability | Speak to Aria | *"Check available slots for Dr. Khushi Sharma today."* Aria queries database & lists open slots. |
| **1:10 - 1:45** | Book & Read-back | Speak booking & phone | *"Book 02:00 PM today, my phone number is 9876543210."* Aria reads phone digit-by-digit; confirm *"Yes, that is correct."* |
| **1:45 - 2:05** | In-Call Receipt & Hangup | Digital card appears | Aria confirms booking; receipt card displays inside phone; click **End Call**; modal auto-closes. |
| **2:05 - 2:30** | Dashboard Verification | Scroll to Appointments table | Point out the new booking at the very top with emerald glow and pulsing `NEW` badge! |

---

## 🎬 Scene-by-Scene Walkthrough

### Scene 1: Dashboard & Authentication Overview (0:00 - 0:25)
**Visual:** Browser showing `http://localhost:8000`. You are already logged in as **Vishu Patel (9876543210)** (or click Login and enter `9876543210` / `password123`).

**Spoken Voiceover (You):**
> *"Hi everyone, this is a demonstration of our Voice AI Doctor Appointment Assistant for NexovAI.  
> As you can see on the dashboard, we have built a Practo-style healthcare interface featuring verified doctors with their specialties and available time slots.  
> In the appointments table below, the user Vishu Patel is logged in, displaying past clinic visits and demo appointments filtered securely to their phone number."*

---

### Scene 2: Launching the Voice Call with Aria (0:25 - 0:45)
**Visual:** Click the glowing blue **"Instant Voice Call"** button in the header (or the banner card). The smartphone chassis pops up, plays realistic ringing audio, and displays the reactive dynamic island and waveform.

**Spoken Voiceover (You):**
> *"Now let's book a new doctor appointment hands-free using our voice assistant, Aria."*
*(Click "Instant Voice Call")*

**Aria (Audio output):**
> *"Hello! I am Aria, your clinical appointment assistant. Which doctor or specialty would you like to see, or would you like me to check available slots?"*

---

### Scene 3: Checking Doctor Availability (0:45 - 1:10)
**Visual:** You speak naturally into your microphone (the audio waveform reacts in real-time).

**You Speak:**
> *"Could you please check available slots for Dr. Khushi Sharma today?"*

**Visual:** Aria's dynamic status shows `Processing...` / `Executing check_doctor_availability`.

**Aria (Audio output):**
> *"Dr. Khushi Sharma has open slots today at 02:00 PM, 03:30 PM, and 04:45 PM. Which time works best for you?"*

**Spoken Voiceover (You, quick whisper/aside):**
> *"Aria executed our backend tool calling against the SQLite database and returned live available slots."*

---

### Scene 4: Booking & Digit-by-Digit Verbal Confirmation (1:10 - 1:45)
**Visual:** You request a specific slot and state your 10-digit phone number.

**You Speak:**
> *"Please book 02:00 PM today. My phone number is 9 8 7 6 5 4 3 2 1 0."*

**Visual:** Aria triggers the verbal confirmation safety protocol. Notice how Aria enunciates each digit clearly.

**Aria (Audio output):**
> *"Just to confirm before I finalize the booking, I have your phone number as 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, for Dr. Khushi Sharma at 02:00 PM. Is that correct?"*

**You Speak:**
> *"Yes, that is correct."*

---

### Scene 5: In-Call Confirmation & Auto-Dismissal (1:45 - 2:05)
**Visual:**
1. A green digital confirmation receipt animates inside the phone screen showing **Dr. Khushi Sharma - Cardiology**, **Today at 02:00 PM**, and **Booking Confirmed**.
2. Aria gives her closing remark.
3. Click the red **End Call** button (or let Aria finish).
4. **The phone call modal automatically dismisses itself after 1 second!**

**Aria (Audio output):**
> *"Your appointment has been successfully booked with Dr. Khushi Sharma for today at 02:00 PM. We have sent a confirmation to your number. Have a wonderful day!"*

**Spoken Voiceover (You):**
> *"The booking is confirmed. Notice how ending the call automatically dismisses the phone modal seamlessly."*

---

### Scene 6: Dashboard Live Verification (2:05 - 2:30)
**Visual:** Screen smoothly scrolls down to the **"My Appointments"** table.

**Spoken Voiceover (You):**
> *"Looking at the appointments table now:  
> Right at the top, highlighted with a vibrant emerald glow and a pulsing 'NEW' badge, is our freshly booked appointment with Dr. Khushi Sharma for 02:00 PM today.  
> The database has been updated in real-time, the slot is now reserved, and only the authenticated user's records are visible.  
> Thank you for watching!"*

*(End recording at ~2m 20s)*

---

## 💡 Quick Tips for a Flawless Recording
1. **Microphone Setup:** Use a headset or earphones so Aria's speech from your speakers doesn't feedback into your microphone.
2. **Alternative Input:** If your microphone has noise or speech recognition mishears, you can click the small keyboard icon at the bottom of the phone modal and type or click one of the quick prompt chips!
3. **Reset for Another Take:** If you want to do another practice take, scroll down to the appointments table and click **"Start Fresh"** on the right side to reset the database back to clean demo state.
