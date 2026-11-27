"""Run the Atlas and its multiplayer arena with Python 3."""
import hashlib
import json
import os
import random
import secrets
import sqlite3
import time
from contextlib import closing
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from accounts import account_action, schema

ROOT = Path(__file__).resolve().parent
DB = os.environ.get("NAHWU_DB", str(ROOT / "arena.sqlite3"))
QUESTS = {
    "i'rab": [
        ("Dalam جَاءَ الطَّالِبُ, apa kedudukan الطَّالِبُ?", "Fā‘il", "Maf‘ūl bih", "Khabar"),
        ("Lengkapi رَأَيْتُ … dengan bentuk yang tepat.", "الطَّالِبَ", "الطَّالِبُ", "الطَّالِبِ"),
        ("Apa tanda jarr pada الْمَسْجِدِ dalam فِي الْمَسْجِدِ?", "Kasrah", "Fatḥah", "Ḍammah"),
        ("Dalam كَتَبَ زَيْدٌ رِسَالَةً, mana maf‘ūl bih?", "رِسَالَةً", "زَيْدٌ", "كَتَبَ"),
        ("Pilih bentuk yang benar sesudah إِلَى.", "الْمَدْرَسَةِ", "الْمَدْرَسَةُ", "الْمَدْرَسَةَ"),
        ("Apa hukum i‘rāb fā‘il?", "Marfū‘", "Majrūr", "Manṣūb"),
    ],
    "jumlah": [
        ("Mana yang merupakan jumlah ismiyyah?", "الْبَيْتُ كَبِيرٌ", "خَرَجَ عَلِيٌّ", "جَلَسَ زَيْدٌ"),
        ("Temukan khabar dalam الْجَوُّ جَمِيلٌ.", "جَمِيلٌ", "الْجَوُّ", "Keduanya"),
        ("Pilih fi‘il māḍī.", "دَرَسَ", "يَدْرُسُ", "اُدْرُسْ"),
        ("Mana yang merupakan jumlah fi‘liyyah?", "نَامَ الطِّفْلُ", "الطِّفْلُ صَغِيرٌ", "الْبَابُ مَفْتُوحٌ"),
        ("Temukan mubtada’ dalam الْعِلْمُ نُورٌ.", "الْعِلْمُ", "نُورٌ", "Keduanya"),
        ("Pilih fi‘il amr.", "اُكْتُبْ", "كَتَبَ", "يَكْتُبُ"),
    ],
}
TIERS = [(0, "Perunggu"), (60, "Perak"), (150, "Emas"), (300, "Safir"), (600, "Master")]
def rank(points):
    return next(name for threshold, name in reversed(TIERS) if points >= threshold)

def require(ok, reason):
    if not ok:
        raise ValueError(reason)

def settle(room, now):
    members = room["members"]
    if room["phase"] == "waiting":
        for key in list(members):
            if now - members[key]["seen"] > 60:
                del members[key]
    elif room["phase"] == "race":
        if now >= room["start"] + 180 or all(p["place"] or p["left"] for p in members.values()):
            room["phase"] = "result"

def api(db, data):
    if data.get("service") == "account":
        return account_action(db, data)
    now = time.time()
    token = data.get("token")
    require(isinstance(token, str) and len(token) == 64 and all(c in "0123456789abcdef" for c in token), "Identitas pemain tidak valid.")
    key = hashlib.sha256(token.encode()).hexdigest()
    name = data.get("name")
    require(isinstance(name, str) and 0 < len(name.strip()) <= 24, "Nama pemain tidak valid.")
    db.execute("INSERT INTO players VALUES (?,0,0) ON CONFLICT(id) DO NOTHING", (key,))
    rooms = {}
    original = {}
    for code, raw in db.execute("SELECT code, body FROM rooms"):
        original[code] = raw
        r = json.loads(raw)
        settle(r, now)
        if not r["members"] or (r["phase"] == "result" and now-r["start"] > 3600):
            db.execute("DELETE FROM rooms WHERE code=?", (code,))
        else:
            rooms[code] = r
    code = next((c for c,r in rooms.items() if key in r["members"] and not r["members"][key]["left"]), None)
    room = rooms.get(code)
    action = data.get("action")
    if action in ("create","join"):
        require(not room, "Keluar dari ruangan saat ini terlebih dahulu.")
        if action == "create":
            quest = data.get("quest")
            require(quest in QUESTS, "Quest tidak tersedia.")
            code = secrets.token_hex(3).upper()
            while code in rooms:
                code = secrets.token_hex(3).upper()
            room = rooms[code] = dict(quest=quest,phase="waiting",members={},start=0)
        else:
            code = data.get("code")
            room = rooms.get(code)
            require(room and room["phase"] == "waiting" and len(room["members"]) < 4, "Ruangan sudah penuh, dimulai, atau ditutup.")
        room["members"][key] = dict(name=name,ready=False,step=0,place=0,seen=now,left=False,elapsed=0)
    elif action != "state":
        require(room and data.get("code") == code, "Sesi ruangan sudah berakhir.")
        p = room["members"][key]
        if action == "leave":
            if room["phase"] == "waiting":
                del room["members"][key]
            else:
                p["left"] = True
                settle(room, now)
            room = None
        elif action == "ready":
            require(room["phase"] == "waiting", "Lomba sudah dimulai.")
            p["ready"] = data.get("ready") is True
        elif action == "start":
            members = room["members"]
            require(room["phase"] == "waiting" and key == next(iter(members)) and len(members)>=2 and all(v["ready"] for v in members.values()), "Minimal dua pemain dan semua harus siap.")
            room.update(phase="race",start=now+4,questions=[])
            for prompt,correct,*others in random.sample(QUESTS[room["quest"]],5):
                choices=[correct,*others]
                random.shuffle(choices)
                room["questions"].append(dict(prompt=prompt,choices=choices,correct=choices.index(correct)))
        elif action == "answer":
            require(room["phase"] == "race" and now >= room["start"] and not p["place"], "Lomba belum aktif atau sudah selesai.")
            require(p["step"] == data.get("step"), "Progres soal sudah berubah.")
            require(now >= p.get("retry",0), "Tunggu sebentar sebelum menjawab lagi.")
            q = room["questions"][p["step"]]
            if q["correct"] == data.get("choice"):
                p["step"] += 1
                if p["step"] == 5:
                    p["place"] = 1 + sum(bool(v["place"]) for k,v in room["members"].items() if k!=key)
                    p["elapsed"] = round(now-room["start"],2)
                    xp, rp = rewards(p["place"])
                    db.execute("UPDATE players SET xp=xp+?,rp=rp+? WHERE id=?", (xp,rp,key))
            else:
                p["retry"] = now+2
            settle(room,now)
        else:
            raise ValueError("Aksi tidak dikenal.")
    if room and room["phase"] == "waiting" and now-room["members"][key]["seen"] >= 12:
        room["members"][key]["seen"] = now
    for c,r in rooms.items():
        body = json.dumps(r)
        if body != original.get(c):
            db.execute("INSERT INTO rooms VALUES (?,?) ON CONFLICT(code) DO UPDATE SET body=excluded.body",(c,body))
    xp,rp=db.execute("SELECT xp,rp FROM players WHERE id=?",(key,)).fetchone()
    result=dict(xp=xp,rp=rp,rank=rank(rp),next=next((t for t,n in TIERS if t>rp),None),rooms=[
        dict(code=c,quest=r["quest"],count=len(r["members"])) for c,r in rooms.items() if r["phase"]=="waiting" and 0<len(r["members"])<4],room=None,now=now)
    if room:
        members=room["members"]
        p=members[key]
        result["room"]=dict(code=code,phase=room["phase"],quest=room["quest"],start=room["start"],host=key==next(iter(members)),members=[
            {**{f:v[f] for f in ("name","ready","step","place","elapsed","left")}, "me":k==key,"host":i==0,"reward":rewards(v["place"])} for i,(k,v) in enumerate(members.items())],retry=p.get("retry",0))
        if room["phase"]=="race" and now>=room["start"] and not p["place"]:
            q=room["questions"][p["step"]]
            result["room"]["question"]={f:q[f] for f in ("prompt","choices")}
    return result

def rewards(place):
    return (100,30) if place==1 else (50,12) if place else (0,0)

class ArenaEndpoint:
    def run_action(self, data):
        with closing(sqlite3.connect(DB,timeout=10)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            return api(db,data)
    def do_POST(self):
        if urlsplit(self.path).path != "/api/arena":
            return self.send_error(404)
        try:
            size = int(self.headers.get("Content-Length",0))
            require(0<size<=512000,"Permintaan terlalu besar.")
            require(self.headers.get_content_type()=="application/json","Format harus JSON.")
            data=json.loads(self.rfile.read(size))
            require(isinstance(data,dict),"Permintaan tidak valid.")
            output=self.run_action(data)
            status=400 if "error" in output else 200
        except (ValueError, TypeError) as e:
            output,status={"error":str(e)},400
        except (sqlite3.Error, ConnectionError):
            output,status={"error":"Database arena belum tersedia. Periksa konfigurasi server atau coba lagi."},503
        body=json.dumps(output).encode()
        self.send_response(status)
        self.send_header("Content-Type","application/json")
        self.send_header("Cache-Control","no-store")
        self.send_header("Content-Length",str(len(body)))
        self.end_headers()
        self.wfile.write(body)

class Handler(ArenaEndpoint, SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT/"dist"),**kwargs)

if __name__=="__main__":
    with closing(sqlite3.connect(DB)) as db:
        schema(db)
        db.commit()
        db.executescript("CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,xp INTEGER,rp INTEGER); CREATE TABLE IF NOT EXISTS rooms(code TEXT PRIMARY KEY,body TEXT);")
    ThreadingHTTPServer(("0.0.0.0",int(os.environ.get("PORT",8000))),Handler).serve_forever()
