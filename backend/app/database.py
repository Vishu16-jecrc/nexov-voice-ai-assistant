"""
SQLite Database manager for NexovAI Doctor Appointment Voice Assistant.
Handles persistence for doctors, time slots, appointments, and live call transcripts.
"""
import sqlite3
import json
import os
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "clinic.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Doctors table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        specialty TEXT NOT NULL,
        bio TEXT,
        avatar TEXT,
        rating REAL DEFAULT 4.9,
        consultation_fee TEXT DEFAULT '$80',
        room_number TEXT DEFAULT 'Room 201'
    )
    """)

    # Available Slots table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS available_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        is_booked INTEGER DEFAULT 0,
        booked_by_phone TEXT,
        booked_at TEXT,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        UNIQUE(doctor_id, date, time)
    )
    """)

    # Appointments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT DEFAULT 'Patient',
        phone_number TEXT NOT NULL,
        doctor_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
    """)

    # Call logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS call_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caller_phone TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration_seconds INTEGER DEFAULT 0,
        transcript_json TEXT DEFAULT '[]',
        action_taken TEXT,
        status TEXT DEFAULT 'completed'
    )
    """)

    conn.commit()
    conn.close()

def seed_sample_data():
    """Seeds doctors and recurring slots for today and the next 7 days."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Check if doctors already seeded
    cursor.execute("SELECT COUNT(*) as count FROM doctors")
    if cursor.fetchone()["count"] > 0:
        conn.close()
        return

    doctors = [
        {
            "name": "Dr. Sarah Jenkins",
            "specialty": "Cardiology",
            "bio": "Specialist in cardiovascular health, hypertension, and heart rhythm disorders.",
            "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
            "rating": 4.95,
            "consultation_fee": "$120",
            "room_number": "Suite 401"
        },
        {
            "name": "Dr. Marcus Vance",
            "specialty": "Dermatology",
            "bio": "Board-certified clinical & cosmetic dermatologist with 12+ years experience.",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
            "rating": 4.88,
            "consultation_fee": "$95",
            "room_number": "Suite 210"
        },
        {
            "name": "Dr. Elena Rostova",
            "specialty": "General Medicine",
            "bio": "Primary care physician focusing on preventive care, routine health exams, and wellness.",
            "avatar": "https://images.unsplash.com/photo-1594824813637-43c220f1883a?auto=format&fit=crop&q=80&w=300",
            "rating": 4.92,
            "consultation_fee": "$75",
            "room_number": "Room 105"
        },
        {
            "name": "Dr. Aris Thorne",
            "specialty": "Orthopedics & Sports Medicine",
            "bio": "Orthopedic surgeon specializing in joint repair, musculoskeletal injuries, and sports therapy.",
            "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
            "rating": 4.97,
            "consultation_fee": "$110",
            "room_number": "Suite 315"
        }
    ]

    for d in doctors:
        cursor.execute("""
        INSERT INTO doctors (name, specialty, bio, avatar, rating, consultation_fee, room_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (d["name"], d["specialty"], d["bio"], d["avatar"], d["rating"], d["consultation_fee"], d["room_number"]))
        doctor_id = cursor.lastrowid

        # Seed slots for today, tomorrow, and next 5 days
        today = date.today()
        standard_times = ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM", "04:45 PM"]
        for day_offset in range(7):
            target_date = (today + timedelta(days=day_offset)).strftime("%Y-%m-%d")
            for t in standard_times:
                cursor.execute("""
                INSERT OR IGNORE INTO available_slots (doctor_id, doctor_name, date, time, is_booked)
                VALUES (?, ?, ?, ?, 0)
                """, (doctor_id, d["name"], target_date, t))

    conn.commit()
    conn.close()

# Public helper queries
def get_all_doctors() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doctors ORDER BY name ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_slots_by_doctor(doctor_name_or_id: Any, target_date: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = """
    SELECT s.*, d.specialty 
    FROM available_slots s
    JOIN doctors d ON s.doctor_id = d.id
    WHERE (d.name LIKE ? OR s.doctor_id = ?)
    """
    params = [f"%{doctor_name_or_id}%", doctor_name_or_id]

    if target_date:
        query += " AND s.date = ?"
        params.append(target_date)
    else:
        # Default to today onwards
        today_str = date.today().strftime("%Y-%m-%d")
        query += " AND s.date >= ?"
        params.append(today_str)

    query += " ORDER BY s.date ASC, s.time ASC"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_appointments() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_appointments_by_phone(phone_number: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    # Normalize phone: digits only
    cleaned_phone = "".join(filter(str.isdigit, phone_number))
    cursor.execute("""
    SELECT * FROM appointments 
    WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone_number, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?
    AND status = 'confirmed'
    ORDER BY appointment_date ASC, appointment_time ASC
    """, (f"%{cleaned_phone}%",))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def save_call_log(caller_phone: Optional[str], start_time: str, end_time: str, duration_sec: int, transcript: list, action_taken: Optional[str]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO call_logs (caller_phone, start_time, end_time, duration_seconds, transcript_json, action_taken, status)
    VALUES (?, ?, ?, ?, ?, ?, 'completed')
    """, (caller_phone, start_time, end_time, duration_sec, json.dumps(transcript), action_taken))
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return log_id

def get_call_logs(limit: int = 15) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM call_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = []
    for r in cursor.fetchall():
        d = dict(r)
        try:
            d["transcript"] = json.loads(d["transcript_json"])
        except Exception:
            d["transcript"] = []
        rows.append(d)
    conn.close()
    return rows
