"""
Generate lesson narration MP3 files using Sarvam Bulbul v4 Flash.

Install:
    py -3.15 -m pip install requests

Set your API key in Windows Command Prompt:
    set SARVAM_API_KEY=your_api_key_here

Then run:
    py make_audio_sarvam.py
"""

import base64
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "sarvam_audio"

# The script checks these names in order.
INPUT_CANDIDATES = [
    "lessons_emotional_ready.js",
    "lessons_emotional.js",
    "lessons.js",
]

API_URL = "https://api.sarvam.ai/text-to-speech"
MODEL = "bulbul:v4-flash"
LANGUAGE_CODE = "hi-IN"

# This is the speaker from your example. You can change it to another
# Bulbul v4 Flash persona ID from Sarvam's voice catalogue.
SPEAKER = "shubh_enhi_ads"

PACE = 1.0
SAMPLE_RATE = 22050
AUDIO_CODEC = "mp3"

# ElevenLabs emotion tags are not understood by Sarvam. Remove a leading
# tag such as [warmly] or [curious] before sending the narration.
EMOTION_TAG_RE = re.compile(
    r"^\s*\[(?:warmly|curious|friendly(?:,\s*explanatory tone)?|"
    r"encouraging|excited|calm|serious|sad|happy)[^\]]*\]\s*",
    re.IGNORECASE,
)


def find_input_file():
    for filename in INPUT_CANDIDATES:
        candidate = BASE_DIR / filename
        if candidate.exists():
            return candidate
    names = ", ".join(INPUT_CANDIDATES)
    raise FileNotFoundError(
        f"Could not find a lessons file. Put one of these beside this script: {names}"
    )


def load_lessons(path):
    raw = path.read_text(encoding="utf-8-sig").strip()

    # Supports either: window.LESSONS = [...]; or a plain JSON array.
    if "=" in raw and not raw.lstrip().startswith("["):
        raw = raw.split("=", 1)[1].strip()
    raw = raw.rstrip().rstrip(";").strip()

    lessons = json.loads(raw)
    if not isinstance(lessons, list):
        raise ValueError("The lessons file must contain a JSON array.")
    return lessons


def clean_narration(text):
    text = str(text or "").strip()
    text = EMOTION_TAG_RE.sub("", text)
    # Remove any remaining leading bracketed delivery tag, without
    # deleting normal punctuation or square brackets in the middle.
    text = re.sub(r"^\s*\[[^\]]{1,50}\]\s*", "", text)
    return text.strip()


def safe_filename(value):
    value = str(value or "lesson")
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value)


def synthesize(session, api_key, text):
    payload = {
        "text": text,
        "language_code": LANGUAGE_CODE,
        "speaker": SPEAKER,
        "model": MODEL,
        "pace": PACE,
        "speech_sample_rate": SAMPLE_RATE,
        "output_audio_codec": AUDIO_CODEC,
    }

    # Retry only temporary server/rate-limit failures. A 4xx response
    # such as an invalid key or exhausted plan will not improve on retry.
    for attempt in range(1, 4):
        response = session.post(
            API_URL,
            headers={
                "api-subscription-key": api_key,
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=120,
        )

        if response.status_code == 429 or response.status_code >= 500:
            if attempt < 3:
                wait = min(5 * attempt, 15)
                print(f"Temporary API error {response.status_code}; retrying in {wait}s...")
                time.sleep(wait)
                continue

        if not response.ok:
            try:
                details = response.json()
            except ValueError:
                details = response.text
            raise RuntimeError(f"API error {response.status_code}: {details}")

        result = response.json()
        audios = result.get("audios") or []
        if not audios:
            raise RuntimeError(f"API returned no audio data: {result}")

        return base64.b64decode(audios[0])

    raise RuntimeError("Audio generation failed after retries.")


def main():
    api_key = "sk_bsh7x88u_44UYm9Nrq9n0DyhO2o5a7zJF"
    if not api_key:
        print("ERROR: SARVAM_API_KEY is not set.")
        print("In Command Prompt, run:")
        print("    set SARVAM_API_KEY=your_api_key_here")
        input("\nPress Enter to close...")
        return 1

    try:
        input_file = find_input_file()
        lessons = load_lessons(input_file)
    except Exception as exc:
        print(f"Could not load lessons: {exc}")
        input("\nPress Enter to close...")
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()

    jobs = []
    for lesson in lessons:
        lesson_id = safe_filename(lesson.get("id", "lesson"))
        for step_number, step in enumerate(lesson.get("steps", []), start=1):
            narration = clean_narration(step.get("s", ""))
            if narration:
                jobs.append((lesson_id, step_number, narration))

    print("Sarvam Hindi Audio Generation Started")
    print(f"Input: {input_file.name}")
    print(f"Model: {MODEL} | Speaker: {SPEAKER} | Pace: {PACE}")
    print(f"Narrations found: {len(jobs)}")
    print(f"Output folder: {OUTPUT_DIR}")
    print("-" * 55)

    success = 0
    skipped = 0
    failed = 0

    for index, (lesson_id, step_number, narration) in enumerate(jobs, start=1):
        output_file = OUTPUT_DIR / f"{lesson_id}-{step_number}.mp3"

        if output_file.exists() and output_file.stat().st_size > 1000:
            skipped += 1
            print(f"[{index}/{len(jobs)}] SKIP (already exists): {output_file.name}")
            continue

        print(f"[{index}/{len(jobs)}] Generating: {output_file.name}")

        try:
            audio_bytes = synthesize(session, api_key, narration)
            output_file.write_bytes(audio_bytes)
            success += 1
            print(f"    SAVED ({len(audio_bytes):,} bytes)")
        except Exception as exc:
            failed += 1
            print(f"    FAILED: {exc}")

            # Stop on authentication, permission, or other client errors.
            message = str(exc)
            if "API error 401" in message or "API error 403" in message:
                print("Stopping: check your Sarvam API key and account permissions.")
                break

        time.sleep(0.4)

    print("\n" + "=" * 55)
    print("GENERATION FINISHED")
    print(f"Successful this run: {success}")
    print(f"Already existed:     {skipped}")
    print(f"Failed:              {failed}")
    print(f"Audio folder:        {OUTPUT_DIR}")
    print("=" * 55)
    input("\nPress Enter to close...")
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
