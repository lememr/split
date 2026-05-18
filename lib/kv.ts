const inMemoryStore = new Map<string, unknown>();
const inMemoryLists = new Map<string, unknown[]>();

let kvInstance: Record<string, (...args: any[]) => Promise<unknown>> | null = null;

async function initKv() {
  if (kvInstance) return kvInstance;
  try {
    const mod = await import('@vercel/kv');
    kvInstance = (mod as any).kv || (mod as any).default || null;
  } catch {
    kvInstance = null;
  }
  return kvInstance;
}

export async function get<T>(key: string): Promise<T | null> {
  try {
    const kv = await initKv();
    if (kv) return (await kv.get(key)) as T | null;
  } catch { /* fallthrough */ }
  return (inMemoryStore.get(key) as T | undefined) ?? null;
}

export async function set<T>(key: string, value: T): Promise<void> {
  try {
    const kv = await initKv();
    if (kv) {
      await kv.set(key, value);
      return;
    }
  } catch { /* fallthrough */ }
  inMemoryStore.set(key, value);
}

export async function del(key: string): Promise<void> {
  try {
    const kv = await initKv();
    if (kv) {
      await kv.del(key);
      return;
    }
  } catch { /* fallthrough */ }
  inMemoryStore.delete(key);
}

export async function lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
  try {
    const kv = await initKv();
    if (kv) {
      const res = await kv.lrange(key, start, stop);
      return (res as T[]) ?? [];
    }
  } catch { /* fallthrough */ }
  const list = (inMemoryLists.get(key) ?? []) as T[];
  if (stop === -1) return list.slice(start);
  return list.slice(start, stop + 1);
}

export async function lpush<T>(key: string, ...values: T[]): Promise<void> {
  try {
    const kv = await initKv();
    if (kv) {
      await kv.lpush(key, ...values);
      return;
    }
  } catch { /* fallthrough */ }
  const list = (inMemoryLists.get(key) ?? []) as T[];
  list.unshift(...values);
  inMemoryLists.set(key, list);
}

export async function lrem<T>(key: string, count: number, value: T): Promise<void> {
  try {
    const kv = await initKv();
    if (kv) {
      await kv.lrem(key, count, value);
      return;
    }
  } catch { /* fallthrough */ }
  const list = (inMemoryLists.get(key) ?? []) as T[];
  const idx = list.indexOf(value);
  if (idx !== -1) list.splice(idx, 1);
  inMemoryLists.set(key, list);
}
