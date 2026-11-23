"""
Entry point to run the NexovAI Voice Assistant Backend.
"""
import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import uvicorn
from app.config import HOST, PORT

if __name__ == "__main__":
    print(f"Starting NexovAI Voice Assistant Backend on http://{HOST}:{PORT}")
    uvicorn.run("app.websocket_server:app", host=HOST, port=PORT, reload=False)
