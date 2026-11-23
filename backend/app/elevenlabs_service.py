"""
ElevenLabs Text-to-Speech & Speech-to-Text Service.
Direct HTTP integration without native C-extension dependencies.
"""
import base64
import httpx
from typing import Optional
from loguru import logger
from .config import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID

class ElevenLabsService:
    def __init__(self, api_key: Optional[str] = None, voice_id: Optional[str] = None):
        self.api_key = api_key or ELEVENLABS_API_KEY
        self.voice_id = voice_id or ELEVENLABS_VOICE_ID
        self.model_id = ELEVENLABS_MODEL_ID

    async def text_to_speech(self, text: str) -> Optional[str]:
        """
        Converts text to speech using ElevenLabs API.
        Returns base64-encoded audio (audio/mp3).
        """
        if not self.api_key:
            logger.info("No ELEVENLABS_API_KEY set; skipping live TTS audio generation.")
            return None

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8
            }
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    b64 = base64.b64encode(res.content).decode("utf-8")
                    return b64
                else:
                    logger.warning(f"ElevenLabs TTS returned status {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            logger.error(f"ElevenLabs TTS request error: {e}")
            return None

    async def speech_to_text(self, audio_bytes: bytes) -> Optional[str]:
        """
        Converts speech audio bytes to text using ElevenLabs Speech-to-Text API.
        """
        if not self.api_key:
            return None

        url = "https://api.elevenlabs.io/v1/speech-to-text"
        headers = {
            "xi-api-key": self.api_key
        }
        files = {
            "file": ("audio.wav", audio_bytes, "audio/wav")
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, headers=headers, files=files)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("text")
                else:
                    logger.warning(f"ElevenLabs STT error: {res.text}")
                    return None
        except Exception as e:
            logger.error(f"ElevenLabs STT exception: {e}")
            return None

elevenlabs_service = ElevenLabsService()
