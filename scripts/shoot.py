#!/usr/bin/env python3
"""Retake 390x844 @2x screenshots of the web export (dist/) into screenshots/.
Free tools only. Run after `npx expo export --platform web`:
  /workspace/.pwvenv/bin/python scripts/shoot.py"""
import pathlib, threading, http.server, functools, socketserver
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST, OUT = ROOT / "dist", ROOT / "screenshots"; OUT.mkdir(exist_ok=True)

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def translate_path(self, path):
        p = super().translate_path(path)
        if not pathlib.Path(p).exists() and pathlib.Path(p + ".html").exists(): return p + ".html"
        return p
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(H, directory=str(DIST)))
port = srv.server_address[1]; threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{port}"
errors = []
CONTACT = r"""
import pathlib
from PIL import Image, ImageDraw
OUT = pathlib.Path("screenshots")
names = ["index", "camera", "recognising", "results", "confirm", "saved", "confirm-mixed", "confirm-mixed-estimate"]
ims = [Image.open(OUT / f"{n}.png").convert("RGB").resize((390, 844)) for n in names]
cols, pad = 4, 16
sheet = Image.new("RGB", (cols * 390 + (cols + 1) * pad, 2 * (844 + 30) + 3 * pad), "white")
d = ImageDraw.Draw(sheet)
for i, (n, im) in enumerate(zip(names, ims)):
    x = pad + (i % cols) * (390 + pad); y = pad + (i // cols) * (844 + 30 + pad)
    d.text((x, y), n, fill="black"); sheet.paste(im, (x, y + 24))
sheet.save(OUT / "contact.png")
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(str(e)))
    def go(path, wait=900):
        pg.goto(BASE + path); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(wait)
    def snap(name, full=False):
        pg.screenshot(path=str(OUT / f"{name}.png"), full_page=full); print("shot", name)
    go("/"); snap("index")
    go("/camera"); snap("camera")
    pg.goto(BASE + "/recognising?sample=chicken-rice"); pg.wait_for_timeout(700); snap("recognising")
    pg.wait_for_url("**/results**", timeout=15000); pg.wait_for_timeout(800); snap("results")
    pg.get_by_text("Chicken rice (roasted)").first.click(); pg.wait_for_url("**/confirm**"); pg.wait_for_timeout(800); snap("confirm")
    pg.get_by_text("Save to Today").first.click(); pg.wait_for_url("**/saved**"); pg.wait_for_timeout(700); snap("saved")
    go("/confirm?mixed=1&sample=cai-png"); snap("confirm-mixed")
    pg.get_by_text("Confirm dishes").first.click(); pg.wait_for_timeout(600)
    pg.mouse.wheel(0, 2000); pg.wait_for_timeout(500); snap("confirm-mixed-estimate")
    b.close()
srv.shutdown()
print("errors:", errors or "none")
# Contact sheet uses the system python3 (Pillow is not in the Playwright venv).
import subprocess, sys
subprocess.run(["python3", "-c", CONTACT], check=True, cwd=ROOT)
