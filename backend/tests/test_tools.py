"""
Unit tests for Doctor Scheduling & Function Calling Tools.
"""
import os
import pytest
from backend.app.database import init_db, seed_sample_data, get_all_doctors, get_all_appointments, get_connection
from backend.app.tools import check_doctor_availability, book_appointment, cancel_appointment

@pytest.fixture(autouse=True)
def setup_test_db():
    seed_sample_data()

def test_get_doctors():
    doctors = get_all_doctors()
    assert len(doctors) >= 4
    names = [d["name"] for d in doctors]
    assert "Dr. Sarah Jenkins" in names
    assert "Dr. Marcus Vance" in names

def test_check_availability():
    res = check_doctor_availability(doctor_name="Sarah", specialty="Cardiology")
    assert res["status"] == "success"
    assert len(res["available_slots"]) > 0
    assert any("Sarah" in slot["doctor_name"] for slot in res["available_slots"])

def test_book_and_cancel_appointment():
    test_phone = "9876543210"

    # 1. Check open slot
    avail = check_doctor_availability(doctor_name="Marcus Vance")
    assert avail["status"] == "success"
    first_slot = avail["available_slots"][0]
    date = first_slot["date"]
    time = first_slot["time"]

    # 2. Book slot
    book_res = book_appointment(
        phone_number=test_phone,
        doctor_name="Dr. Marcus Vance",
        date_str=date,
        time_str=time,
        patient_name="Alex Mercer"
    )
    assert book_res["status"] == "success"
    apt_id = book_res["appointment_id"]
    assert apt_id is not None
    assert book_res["phone_number"] == test_phone

    # 3. Verify slot is now marked booked
    avail_after = check_doctor_availability(doctor_name="Marcus Vance", date_str=date)
    booked_times = [s["time"] for s in avail_after["available_slots"] if s["time"] == time]
    assert len(booked_times) == 0

    # 4. Cancel appointment
    cancel_res = cancel_appointment(phone_number=test_phone, appointment_id=apt_id)
    assert cancel_res["status"] == "success"
    assert cancel_res["phone_number"] == test_phone

    # 5. Verify slot is freed
    avail_freed = check_doctor_availability(doctor_name="Marcus Vance", date_str=date)
    freed_times = [s["time"] for s in avail_freed["available_slots"] if s["time"] == time]
    assert len(freed_times) == 1
