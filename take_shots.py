#!/usr/bin/env python3
"""Takes Vice Frame — Cover Lab's entry screenshots.

Serves app/ on a local port, opens each scene from shots.json in headless Chromium at the scene's
size, waits for the app to signal window.__shotReady, captures the page, and writes screenshots/ as
JPEGs inside the gate's caps (at most 256 KiB, long side at most 1280 px, short side at least 480 px),
lowering the JPEG quality until a shot fits. Run from the repository root:

    python3 take_shots.py
"""

import functools
import http.server
import json
import threading
from io import BytesIO
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
APP_DIR = ROOT / "app"
SHOTS_FILE = ROOT / "shots.json"
OUT_DIR = ROOT / "screenshots"
PORT = 8901
MAX_BYTES = 262_144


def serve_app() -> http.server.ThreadingHTTPServer:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(APP_DIR))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def save_jpeg_under_cap(png_bytes: bytes, dest: Path) -> None:
    """Writes the capture as a JPEG, stepping quality down until it fits the 256 KiB cap."""
    image = Image.open(BytesIO(png_bytes)).convert("RGB")
    for quality in (90, 84, 78, 72, 66, 60, 52, 44):
        buffer = BytesIO()
        image.save(buffer, "JPEG", quality=quality, optimize=True)
        if buffer.tell() <= MAX_BYTES:
            dest.write_bytes(buffer.getvalue())
            print(f"{dest.name}: {image.width}x{image.height}, {buffer.tell()} bytes at quality {quality}")
            return
    raise SystemExit(f"{dest.name}: still over {MAX_BYTES} bytes at the lowest quality tried")


def main() -> None:
    shots = json.loads(SHOTS_FILE.read_text())
    OUT_DIR.mkdir(exist_ok=True)
    for old in OUT_DIR.iterdir():
        if old.is_file():
            old.unlink()
    server = serve_app()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            for shot in shots:
                page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
                url = f"http://127.0.0.1:{PORT}/index.html{shot['query']}"
                page.goto(url)
                page.wait_for_function("window.__shotReady === true", timeout=30_000)
                page.wait_for_timeout(250)
                png = page.screenshot(type="png")
                save_jpeg_under_cap(png, OUT_DIR / shot["name"])
                page.close()
            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
