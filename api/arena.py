"""Vercel entry point for local and GitHub Pages players."""
import os
from http.server import BaseHTTPRequestHandler

import psycopg
from accounts import schema
from server import ArenaEndpoint, api


class PostgresArena:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, params=()):
        # All statements come from the shared arena engine, using SQLite markers.
        return self.connection.execute(sql.replace("?", "%s"), params)


_initialized = False


class handler(ArenaEndpoint, BaseHTTPRequestHandler):
    def end_headers(self):
        # Arena identity is an explicit token in the request, never a cookie.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def run_action(self, data):
        global _initialized
        url = os.getenv("DATABASE_URL")
        if not url:
            raise ConnectionError("DATABASE_URL")
        try:
            with psycopg.connect(url, connect_timeout=4, prepare_threshold=None) as conn:
                # Serialize race decisions across concurrent function instances.
                conn.execute("SELECT pg_advisory_xact_lock(71329001)")
                if not _initialized:
                    conn.execute("CREATE SCHEMA IF NOT EXISTS nahwuquest")
                conn.execute("SET LOCAL search_path TO nahwuquest")
                if not _initialized:
                    conn.execute("CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY, xp INTEGER NOT NULL, rp INTEGER NOT NULL)")
                    conn.execute("CREATE TABLE IF NOT EXISTS rooms(code TEXT PRIMARY KEY, body TEXT NOT NULL)")
                    schema(PostgresArena(conn))
                result = api(PostgresArena(conn), data)
            _initialized = True
            return result
        except psycopg.Error as exc:
            raise ConnectionError("database unavailable") from exc
