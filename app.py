"""Local development only. Run python app.py; binds exclusively to loopback."""
import json
import secrets
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from diner_core.catalog import Catalog

ROOT = Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
DB = ROOT / "private-data" / "diner.sqlite3"

class Handler(BaseHTTPRequestHandler):
    def send(self, status, body, kind="application/json; charset=utf-8"):
        raw = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(raw)
    def allowed(self):
        return self.headers.get("Host") in ("127.0.0.1:8765", "localhost:8765")
    def do_GET(self):
        if not self.allowed():
            return self.send(403, "{}")
        assets = {"/":("web/index.html","text/html"),"/app.js":("web/app.js","text/javascript"),
                  "/style.css":("web/style.css","text/css")}
        if self.path in assets:
            path, kind = assets[self.path]
            return self.send(200,(ROOT/path).read_text(),kind+"; charset=utf-8")
        if self.path == "/api/state":
            catalog = Catalog(DB)
            try:
                self.send(200,json.dumps({"ingredients":catalog.ingredients(),"recipes":catalog.recipes(),"token":TOKEN},ensure_ascii=False))
            finally:
                catalog.close()
            return
        self.send(404, "{}")
    def do_POST(self):
        if not self.allowed() or self.headers.get("X-Diner-Token") != TOKEN:
            return self.send(403, json.dumps({"error":"درخواست معتبر نیست"}))
        if self.path not in ("/api/ingredients", "/api/recipes"):
            return self.send(404,"{}")
        catalog = None
        try:
            size = int(self.headers.get("Content-Length","0"))
            if not 0 < size <= 100000:
                raise ValueError("حجم درخواست معتبر نیست")
            data = json.loads(self.rfile.read(size))
            catalog = Catalog(DB)
            if self.path == "/api/ingredients":
                catalog.add_ingredient(data)
            else:
                catalog.save_recipe(data)
            self.send(201,'{"ok":true}')
        except (ValueError, KeyError, TypeError, OverflowError):
            self.send(400,json.dumps({"error":"اطلاعات معتبر نیست؛ نام، منبع، مقدار، بازده و قیمت‌ها را بررسی کنید."}))
        finally:
            if catalog:
                catalog.close()

if __name__ == "__main__":
    DB.parent.mkdir(exist_ok=True)
    print("Diner: http://127.0.0.1:8765 — local development only", flush=True)
    HTTPServer(("127.0.0.1",8765),Handler).serve_forever()
