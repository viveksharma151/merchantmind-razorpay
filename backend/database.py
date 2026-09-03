import aiosqlite
import json
from datetime import datetime
from models import AuditEntry

DB_PATH = "audit.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent TEXT NOT NULL,
                action TEXT NOT NULL,
                input_data TEXT NOT NULL,
                output_data TEXT NOT NULL,
                reasoning TEXT,
                status TEXT NOT NULL,
                explainability TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        await db.commit()


async def log_audit(entry: AuditEntry):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO audit_log
            (agent, action, input_data, output_data, reasoning, status, explainability, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry.agent,
            entry.action,
            json.dumps(entry.input_data),
            json.dumps(entry.output_data),
            entry.reasoning,
            entry.status.value if hasattr(entry.status, 'value') else entry.status,
            entry.explainability,
            entry.timestamp.isoformat() if entry.timestamp else datetime.utcnow().isoformat()
        ))
        await db.commit()


async def get_audit_log(limit: int = 100) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            result = []
            for row in rows:
                d = dict(row)
                try:
                    d['input_data'] = json.loads(d['input_data'])
                except Exception:
                    pass
                try:
                    d['output_data'] = json.loads(d['output_data'])
                except Exception:
                    pass
                result.append(d)
            return result


async def get_audit_stats() -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM audit_log") as cursor:
            total = (await cursor.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM audit_log WHERE status='SUCCESS'") as cursor:
            success = (await cursor.fetchone())[0]
        async with db.execute("SELECT COUNT(DISTINCT agent) FROM audit_log") as cursor:
            agents = (await cursor.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM audit_log WHERE status='FAILED'") as cursor:
            failed = (await cursor.fetchone())[0]
        return {
            "total_actions": total,
            "successful": success,
            "failed": failed,
            "agents_active": agents
        }
