"""Generate the public endpoint setting for the Pages artifact."""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

base = os.environ.get("ARENA_BACKEND_URL", "").strip().rstrip("/")
url = urlsplit(base)
if (url.scheme != "https" or not url.hostname or url.netloc != url.hostname
        or url.path or url.query or url.fragment):
    raise SystemExit("Isi repository variable ARENA_BACKEND_URL dengan origin HTTPS Vercel, misalnya https://nama-proyek.vercel.app")
Path("dist/arena-config.js").write_text("window.NAHWU_ARENA_URL = " + json.dumps(base + "/api/arena") + ";\n")
