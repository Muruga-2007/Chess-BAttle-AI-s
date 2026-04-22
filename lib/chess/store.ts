import { advanceRecord, createSessionRecord, serializeRecord } from "@/lib/chess/orchestrator";
import type { CreateSessionInput } from "@/lib/chess/types";

const store = new Map<string, ReturnType<typeof createSessionRecord>>();

export function createSession(input: CreateSessionInput) {
  const record = createSessionRecord(input);
  store.set(record.id, record);
  return serializeRecord(record);
}

export function getSession(id: string) {
  const record = store.get(id);
  return record ? serializeRecord(record) : null;
}

export function advanceSession(id: string) {
  const record = store.get(id);

  if (!record) {
    return null;
  }

  advanceRecord(record);
  return serializeRecord(record);
}
