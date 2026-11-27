"""Persistent accounts and the shared classroom atlas."""
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import unicodedata
from pathlib import Path


def schema(db):
    for definition in (
        "accounts(id TEXT PRIMARY KEY, login TEXT UNIQUE NOT NULL, salt TEXT, digest TEXT, profile TEXT, revision INTEGER)",
        "sessions(digest TEXT PRIMARY KEY, owner TEXT, expires BIGINT)",
        "catalog(id INTEGER PRIMARY KEY, body TEXT, revision INTEGER)",
        "attempts(login TEXT PRIMARY KEY, count INTEGER, since BIGINT)",
    ):
        db.execute("CREATE TABLE IF NOT EXISTS " + definition)
    if not db.execute("SELECT id FROM catalog WHERE id=1").fetchone():
        seed = Path(__file__).with_name("catalog.json").read_text()
        db.execute("INSERT INTO catalog VALUES (1,?,0)", (seed,))


def check(condition, message):
    if not condition:
        raise ValueError(message)


def field(value, limit, required=True):
    check(isinstance(value, str) and len(value) <= limit and (value.strip() or not required),
          "Isian kosong atau terlalu panjang.")
    return value.strip()


def teacher(owner):
    return owner in os.environ.get("TEACHER_ACCOUNT_IDS", "").split(",")


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def catalog(db):
    raw, rev = db.execute("SELECT body, revision FROM catalog WHERE id=1").fetchone()
    return json.loads(raw), rev


def valid_profile(p, worlds):
    check(isinstance(p, dict), "Profil tidak valid.")
    quests = {q["id"]: q for w in worlds for q in w["quests"]}
    done = p.get("done", [])
    steps = p.get("steps", {})
    check(isinstance(done, list) and all(type(i) is int and i in quests for i in done)
          and isinstance(steps, dict), "Progres quest tidak valid.")
    done = list(dict.fromkeys(done))
    skin = p.get("skin", 0)
    gates = [0,1,3,6,2,4,5,8,10,12,15,18]
    world = p.get("world", 0)
    return dict(name=field(p.get("name"), 24), done=done,
                steps={str(i): n for i in quests if type(n := steps.get(str(i))) is int
                       and 0 < n < len(quests[i]["questions"])},
                skin=skin if type(skin) is int and 0 <= skin < len(gates) and gates[skin] <= len(done) else 0,
                world=world if type(world) is int and 0 <= world < len(worlds) else 0)


def account_action(db, data):
    action = data.get("action")
    now = int(time.time())
    if action in ("register", "login"):
        login = unicodedata.normalize("NFKC", field(data.get("login"), 48)).casefold()
        password = data.get("password")
        check(isinstance(password, str) and 1 <= len(password) <= 128, "Kata sandi tidak valid.")
        row = db.execute("SELECT id,salt,digest FROM accounts WHERE login=?", (login,)).fetchone()
        if action == "register":
            check(not row, "Nama pengguna sudah dipakai.")
            check(len(password) >= 8, "Gunakan minimal 8 karakter untuk kata sandi.")
            salt = secrets.token_hex(16)
            owner = secrets.token_hex(16)
            imported = data.get("profile", {})
            p = valid_profile(imported, catalog(db)[0])
            arena = imported.get("arenaToken")
            p["arenaToken"] = arena if isinstance(arena,str) and re.fullmatch("[a-f0-9]{64}", arena) else secrets.token_hex(32)
            digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600000).hex()
            db.execute("INSERT INTO accounts VALUES (?,?,?,?,?,0)", (owner,login,salt,digest,json.dumps(p)))
        else:
            check(row, "Nama pengguna atau kata sandi salah.")
            attempt = db.execute("SELECT count,since FROM attempts WHERE login=?", (login,)).fetchone()
            count, since = attempt if attempt and now-attempt[1]<300 else (0, now)
            check(count < 8, "Terlalu banyak percobaan. Coba lagi dalam 5 menit.")
            owner,salt,expected = row
            digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600000).hex()
            if not hmac.compare_digest(digest,expected):
                db.execute("INSERT INTO attempts VALUES (?,?,?) ON CONFLICT(login) DO UPDATE SET count=excluded.count,since=excluded.since",(login,count+1,since))
                return {"error":"Nama pengguna atau kata sandi salah."}
            db.execute("DELETE FROM attempts WHERE login=?", (login,))
        session = secrets.token_urlsafe(32)
        db.execute("DELETE FROM sessions WHERE expires<=?",(now,))
        db.execute("INSERT INTO sessions VALUES (?,?,?)",(token_hash(session),owner,now+30*86400))
    else:
        session = field(data.get("session",""), 128, False)
        row = db.execute("SELECT owner FROM sessions WHERE digest=? AND expires>?", (token_hash(session),now)).fetchone()
        if not row:
            return {"error":"Sesi berakhir. Silakan masuk kembali.", "expired":True}
        owner = row[0]
    if action == "logout":
        db.execute("DELETE FROM sessions WHERE digest=?", (token_hash(session),))
        return {"ok":True}
    worlds, version = catalog(db)
    if action == "publish":
        check(teacher(owner), "Hanya guru yang dapat menerbitkan perubahan.")
        check(data.get("version")==version, "Atlas telah berubah. Muat ulang sebelum mengedit kembali.")
        wid = data.get("world")
        check(type(wid) is int and 0<=wid<=len(worlds), "Wilayah tidak tersedia.")
        if data.get("kind") == "map":
            if wid == len(worlds):
                worlds.append({"quests":[]})
            worlds[wid].update(title=field(data.get("title"),100), theme=field(data.get("theme"),300))
        else:
            check(wid<len(worlds), "Simpan map terlebih dahulu.")
            quests = worlds[wid]["quests"]
            qid = data.get("quest")
            target = next((q for q in quests if q["id"]==qid),None)
            check(target or qid is None, "Quest tidak ditemukan.")
            lesson, rows = data.get("lesson"), data.get("questions")
            check(isinstance(lesson,list) and len(lesson)==5 and isinstance(rows,list) and 1<=len(rows)<=30, "Isi 1–30 soal.")
            lesson = [field(s,100 if j==0 else 1000,j==0) for j,s in enumerate(lesson)]
            questions = []
            for row in rows:
                check(isinstance(row,list) and len(row)==5, "Soal tidak lengkap.")
                question = [field(s,600,j<4) for j,s in enumerate(row)]
                check(len(set(question[1:4]))==3, "Ketiga pilihan jawaban harus berbeda.")
                questions.append(question)
            if target is None:
                target = {"id":1+max((q["id"] for w in worlds for q in w["quests"]), default=-1)}
                quests.append(target)
            target.update(lesson=lesson,questions=questions)
        version += 1
        db.execute("UPDATE catalog SET body=?,revision=? WHERE id=1",(json.dumps(worlds),version))
        return dict(worlds=worlds,version=version)
    raw, revision = db.execute("SELECT profile,revision FROM accounts WHERE id=?",(owner,)).fetchone()
    stored = json.loads(raw)
    if action == "save":
        check(data.get("revision")==revision, "Progres berubah di perangkat lain. Muat ulang halaman.")
        check(data.get("version")==version, "Guru telah memperbarui atlas. Muat ulang halaman.")
        profile = valid_profile(data.get("profile"),worlds)
        profile["arenaToken"] = stored["arenaToken"]
        db.execute("UPDATE accounts SET profile=?,revision=? WHERE id=?",(json.dumps(profile),revision+1,owner))
        return {"revision":revision+1}
    check(action in ("login","register","resume"), "Aksi akun tidak dikenal.")
    p = valid_profile(stored, worlds)
    arena = stored["arenaToken"]
    score = db.execute("SELECT xp,rp FROM players WHERE id=?", (token_hash(arena),)).fetchone() or (0,0)
    from server import rank
    p.update(id=owner,arenaToken=arena,arenaXP=score[0],arenaRP=score[1],arenaRank=rank(score[1]))
    return dict(session=session,profile=p,revision=revision,worlds=worlds,version=version,teacher=teacher(owner))
