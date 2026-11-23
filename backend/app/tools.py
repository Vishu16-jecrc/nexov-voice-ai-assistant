"""
Core tools for the Voice AI Doctor Appointment Assistant.
Registered as function calling tools in Pipecat & Gemini/LLM.
"""
import re
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from .database import get_connection, get_all_doctors

def normalize_phone(phone: str) -> str:
    """Extracts only digits from phone number strings."""
    digits = re.sub(r"\D", "", phone or "")
    return digits

def check_doctor_availability(
    doctor_name: Optional[str] = None,
    specialty: Optional[str] = None,
    date_str: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns the available slots for a doctor (and/or date or specialty)
    so the agent can offer them to the caller.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Determine target date if relative word used
    today = date.today()
    resolved_date = None
    if date_str:
        lower_d = date_str.lower().strip()
        if "today" in lower_d:
            resolved_date = today.strftime("%Y-%m-%d")
        elif "tomorrow" in lower_d:
            resolved_date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            # Try to match YYYY-MM-DD or standard formats
            match = re.search(r"\d{4}-\d{2}-\d{2}", date_str)
            if match:
                resolved_date = match.group(0)

    # Base query for unbooked slots
    query = """
    SELECT s.id as slot_id, s.date, s.time, d.id as doctor_id, d.name as doctor_name, d.specialty, d.room_number, d.consultation_fee
    FROM available_slots s
    JOIN doctors d ON s.doctor_id = d.id
    WHERE s.is_booked = 0
    """
    params = []

    if doctor_name:
        clean_doc = doctor_name.replace("Dr.", "").replace("Doctor", "").strip()
        query += " AND (d.name LIKE ? OR d.name LIKE ?)"
        params.extend([f"%{clean_doc}%", f"%{doctor_name}%"])

    if specialty:
        query += " AND d.specialty LIKE ?"
        params.append(f"%{specialty}%")

    if resolved_date:
        query += " AND s.date = ?"
        params.append(resolved_date)
    else:
        # Default to today onwards
        query += " AND s.date >= ?"
        params.append(today.strftime("%Y-%m-%d"))

    query += " ORDER BY s.date ASC, s.time ASC LIMIT 10"

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    if not rows:
        # Provide general doctor list as fallback
        docs = get_all_doctors()
        doc_summaries = [f"{d['name']} ({d['specialty']})" for d in docs]
        return {
            "status": "not_found",
            "message": f"No slots found matching your criteria. Available doctors are: {', '.join(doc_summaries)}. Would you like to check another doctor or another day?",
            "available_slots": [],
            "doctors": doc_summaries
        }

    slots_by_date: Dict[str, List[str]] = {}
    doctors_found = set()
    for r in rows:
        doctors_found.add(f"{r['doctor_name']} ({r['specialty']})")
        slots_by_date.setdefault(r["date"], []).append(f"{r['time']} with {r['doctor_name']}")

    readable_slots = []
    for d, slot_list in slots_by_date.items():
        readable_slots.append(f"On {d}: {', '.join(slot_list)}")

    return {
        "status": "success",
        "doctor_count": len(doctors_found),
        "doctors": list(doctors_found),
        "summary": " | ".join(readable_slots),
        "available_slots": rows
    }


def book_appointment(
    phone_number: str,
    doctor_name: str,
    date_str: str,
    time_str: str,
    patient_name: Optional[str] = "Patient",
    notes: Optional[str] = ""
) -> Dict[str, Any]:
    """
    Books a selected slot for the caller, using the phone number the caller told the agent.
    Rules:
    - The caller is identified ONLY by the phone number they speak out loud.
    - Slot must be available.
    """
    digits = normalize_phone(phone_number)
    if len(digits) < 7:
        return {
            "status": "error",
            "message": "Invalid phone number provided. Please ask the caller to clearly state their full phone number."
        }

    # Resolve date if relative
    today = date.today()
    resolved_date = date_str
    if "today" in date_str.lower():
        resolved_date = today.strftime("%Y-%m-%d")
    elif "tomorrow" in date_str.lower():
        resolved_date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        m = re.search(r"\d{4}-\d{2}-\d{2}", date_str)
        if m:
            resolved_date = m.group(0)

    # Standardize time format (e.g., 9:00 AM -> 09:00 AM)
    normalized_time = time_str.strip().upper()
    if re.match(r"^\d:\d{2}", normalized_time):
        normalized_time = "0" + normalized_time

    clean_doc = doctor_name.replace("Dr.", "").replace("Doctor", "").strip()

    conn = get_connection()
    cursor = conn.cursor()

    # Find doctor
    cursor.execute("SELECT id, name, specialty, room_number FROM doctors WHERE name LIKE ? OR name LIKE ? LIMIT 1",
                   (f"%{clean_doc}%", f"%{doctor_name}%"))
    doc_row = cursor.fetchone()
    if not doc_row:
        conn.close()
        return {
            "status": "error",
            "message": f"Could not find doctor matching '{doctor_name}'. Please verify the doctor's name."
        }

    doc_id = doc_row["id"]
    full_doc_name = doc_row["name"]
    specialty = doc_row["specialty"]
    room = doc_row["room_number"]

    # Check slot availability
    cursor.execute("""
    SELECT id, is_booked FROM available_slots
    WHERE doctor_id = ? AND date = ? AND (time LIKE ? OR time = ?)
    LIMIT 1
    """, (doc_id, resolved_date, f"%{normalized_time}%", normalized_time))
    slot_row = cursor.fetchone()

    now_iso = datetime.now().isoformat()

    if not slot_row:
        # Check if slot exists at all or if any other slots on that date
        cursor.execute("SELECT time FROM available_slots WHERE doctor_id = ? AND date = ? AND is_booked = 0",
                       (doc_id, resolved_date))
        other_slots = [r["time"] for r in cursor.fetchall()]
        conn.close()
        if other_slots:
            return {
                "status": "slot_unavailable",
                "message": f"That exact time is not on the schedule for {resolved_date}. Open times for {full_doc_name} are: {', '.join(other_slots)}."
            }
        return {
            "status": "slot_unavailable",
            "message": f"No available slots for {full_doc_name} on {resolved_date}. Please ask caller to pick another date."
        }

    if slot_row["is_booked"] == 1:
        cursor.execute("SELECT time FROM available_slots WHERE doctor_id = ? AND date = ? AND is_booked = 0",
                       (doc_id, resolved_date))
        alt_slots = [r["time"] for r in cursor.fetchall()]
        conn.close()
        return {
            "status": "slot_already_booked",
            "message": f"That time slot on {resolved_date} is already booked. Alternative open slots are: {', '.join(alt_slots)}."
        }

    slot_id = slot_row["id"]

    # Mark slot booked
    cursor.execute("""
    UPDATE available_slots 
    SET is_booked = 1, booked_by_phone = ?, booked_at = ?
    WHERE id = ?
    """, (digits, now_iso, slot_id))

    # Insert appointment
    cursor.execute("""
    INSERT INTO appointments (
        patient_name, phone_number, doctor_id, doctor_name, specialty, 
        appointment_date, appointment_time, status, notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
    """, (patient_name, digits, doc_id, full_doc_name, specialty, resolved_date, normalized_time, notes, now_iso))

    appointment_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "appointment_id": appointment_id,
        "patient_name": patient_name,
        "phone_number": digits,
        "doctor_name": full_doc_name,
        "specialty": specialty,
        "date": resolved_date,
        "time": normalized_time,
        "room_number": room,
        "confirmation_message": f"Appointment booked successfully with {full_doc_name} on {resolved_date} at {normalized_time} for phone {digits}."
    }


def cancel_appointment(
    phone_number: str,
    appointment_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Cancels the caller's existing appointment, found using the phone number the caller told the agent.
    Rules:
    - Finds active confirmed appointments using the caller's spoken phone number.
    - Frees the slot so someone else can book it.
    """
    digits = normalize_phone(phone_number)
    if len(digits) < 7:
        return {
            "status": "error",
            "message": "Invalid phone number provided. Please ask the caller for their complete phone number."
        }

    conn = get_connection()
    cursor = conn.cursor()

    if appointment_id:
        cursor.execute("SELECT * FROM appointments WHERE id = ? AND status = 'confirmed'", (appointment_id,))
    else:
        cursor.execute("""
        SELECT * FROM appointments 
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone_number, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?
        AND status = 'confirmed'
        ORDER BY id DESC LIMIT 1
        """, (f"%{digits}%",))

    apt = cursor.fetchone()
    if not apt:
        conn.close()
        return {
            "status": "not_found",
            "message": f"No active confirmed appointments found under phone number {digits}. Please verify the number."
        }

    apt_id = apt["id"]
    doc_id = apt["doctor_id"]
    doc_name = apt["doctor_name"]
    apt_date = apt["appointment_date"]
    apt_time = apt["appointment_time"]
    now_iso = datetime.now().isoformat()

    # Update appointment status
    cursor.execute("UPDATE appointments SET status = 'cancelled', updated_at = ? WHERE id = ?", (now_iso, apt_id))

    # Free the slot
    cursor.execute("""
    UPDATE available_slots 
    SET is_booked = 0, booked_by_phone = NULL, booked_at = NULL
    WHERE doctor_id = ? AND date = ? AND (time = ? OR time LIKE ?)
    """, (doc_id, apt_date, apt_time, f"%{apt_time}%"))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "appointment_id": apt_id,
        "doctor_name": doc_name,
        "date": apt_date,
        "time": apt_time,
        "phone_number": digits,
        "message": f"Your appointment with {doc_name} on {apt_date} at {apt_time} has been successfully cancelled."
    }
