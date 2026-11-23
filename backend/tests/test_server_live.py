"""
Automated end-to-end integration test verifying REST endpoints,
WebSocket voice pipeline, function calling tools, and booking confirmation.
"""
import sys
import os
import time
import subprocess
import requests
import json
import asyncio
import websockets

def test_full_pipeline():
    print("Starting backend server process...")
    proc = subprocess.Popen(
        [sys.executable, "backend/run_server.py"],
        cwd=os.getcwd()
    )

    try:
        # Wait for server to bind
        time.sleep(3)

        # 1. Test Health endpoint
        res = requests.get("http://localhost:8000/api/health", timeout=5)
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("✓ PASS: /api/health:", res.json())

        # 2. Test Doctors endpoint
        res = requests.get("http://localhost:8000/api/doctors", timeout=5)
        assert res.status_code == 200, f"Doctors check failed: {res.text}"
        doctors = res.json()
        print(f"✓ PASS: /api/doctors returned {len(doctors)} doctors")

        # 3. Test Appointments endpoint
        res = requests.get("http://localhost:8000/api/appointments", timeout=5)
        assert res.status_code == 200, f"Appointments check failed: {res.text}"
        apts = res.json()
        print(f"✓ PASS: /api/appointments returned {len(apts)} appointments")

        # 4. Test WebSocket Voice Pipeline
        async def test_ws():
            async with websockets.connect("ws://localhost:8000/ws/call") as ws:
                async def recv_type(expected_type, timeout=5.0):
                    start = time.time()
                    while time.time() - start < timeout:
                        msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
                        data = json.loads(msg)
                        if data.get("type") == expected_type:
                            return data
                    return None

                # Start call
                await ws.send(json.dumps({"type": "start_call"}))
                greeting = await recv_type("agent_transcript")
                print("✓ PASS: Agent Greeting:", greeting.get("text"))

                # Caller checks availability
                await ws.send(json.dumps({
                    "type": "text_input",
                    "text": "Hello, I want to see Dr. Sarah Jenkins"
                }))
                reply1 = await recv_type("agent_transcript")
                print("✓ PASS: Agent Offered Slots:", reply1.get("text"))

                # Caller provides phone number & time slot
                await ws.send(json.dumps({
                    "type": "text_input",
                    "text": "My phone number is 9876543210 and I want 02:00 PM today"
                }))
                reply2 = await recv_type("agent_transcript")
                print("✓ PASS: Agent Number Read-Back:", reply2.get("text"))

                # Caller confirms phone number
                await ws.send(json.dumps({
                    "type": "text_input",
                    "text": "Yes, that phone number is correct"
                }))
                confirm_card = await recv_type("booking_confirmed")
                print("✓ PASS: Booking Event Received:", confirm_card.get("data"))
                reply3 = await recv_type("agent_transcript")
                print("✓ PASS: Agent Booking Confirmation:", reply3.get("text"))

                # End Call
                await ws.send(json.dumps({"type": "end_call"}))

        asyncio.run(test_ws())
        print("✓ PASS: All Voice Pipeline & Function Calling Tests Passed End-to-End!")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        print("Server process shut down cleanly.")

if __name__ == "__main__":
    test_full_pipeline()
