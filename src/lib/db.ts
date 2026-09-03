import fs from 'fs';
import path from 'path';
import { AuditEntry, AuditStats, AuditStatus } from './types';

const AUDIT_FILE = path.join(process.cwd(), 'audit_ledger.json');

// In-memory cache
let auditLogCache: AuditEntry[] = [];

// Load existing records if file exists
function loadLedger(): AuditEntry[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const data = fs.readFileSync(AUDIT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read audit ledger file:', err);
  }
  return [];
}

// Save records to file
function saveLedger(entries: AuditEntry[]) {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write audit ledger file:', err);
  }
}

// Initialize
auditLogCache = loadLedger();

export async function logAudit(entry: {
  agent: string;
  action: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  reasoning: string;
  status: AuditStatus;
  explainability: string;
}): Promise<AuditEntry> {
  const newEntry: AuditEntry = {
    id: auditLogCache.length + 1,
    agent: entry.agent,
    action: entry.action,
    input_data: entry.input_data,
    output_data: entry.output_data,
    reasoning: entry.reasoning,
    status: entry.status,
    explainability: entry.explainability,
    timestamp: new Date().toISOString(),
  };

  auditLogCache.unshift(newEntry); // newest first
  saveLedger(auditLogCache);
  return newEntry;
}

export async function getAuditLog(limit: number = 100): Promise<AuditEntry[]> {
  return auditLogCache.slice(0, limit);
}

export async function getAuditStats(): Promise<AuditStats> {
  const total = auditLogCache.length;
  const successful = auditLogCache.filter(e => e.status === 'SUCCESS').length;
  const failed = auditLogCache.filter(e => e.status === 'FAILED').length;
  const uniqueAgents = new Set(auditLogCache.map(e => e.agent)).size;

  return {
    total_actions: total,
    successful,
    failed,
    agents_active: uniqueAgents || 4, // 4 agents in system
  };
}
