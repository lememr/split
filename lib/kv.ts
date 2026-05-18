import { put, list } from '@vercel/blob';

const STATE_KEY = 'split-state.json';

interface SplitState {
  [key: string]: any;
}

// Cache simples pra evitar ler muitas vezes no mesmo request
let memoryCache: SplitState | null = null;

async function fetchState(): Promise<SplitState> {
  if (memoryCache) return memoryCache;
  try {
    const { blobs } = await list({ prefix: STATE_KEY, limit: 1 });
    if (!blobs || blobs.length === 0) {
      memoryCache = {};
      return memoryCache;
    }
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch state');
    const state = await res.json() as SplitState;
    memoryCache = state;
    return state;
  } catch {
    memoryCache = {};
    return memoryCache;
  }
}

async function saveState(state: SplitState): Promise<void> {
  memoryCache = state;
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  await put(STATE_KEY, blob, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// Misma interfaz que el antiguo kv.ts
export async function get<T>(key: string): Promise<T | null> {
  const state = await fetchState();
  const value = state[key];
  return value !== undefined ? (value as T) : null;
}

export async function set<T>(key: string, value: T): Promise<void> {
  const state = await fetchState();
  state[key] = value;
  await saveState(state);
}

export async function del(key: string): Promise<void> {
  const state = await fetchState();
  delete state[key];
  await saveState(state);
}

export async function lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
  const list = (await get<T[]>(key)) ?? [];
  if (stop === -1) return list.slice(start);
  return list.slice(start, stop + 1);
}

export async function lpush<T>(key: string, ...values: T[]): Promise<void> {
  const list = (await get<T[]>(key)) ?? [];
  list.unshift(...values);
  await set(key, list);
}

export async function lrem<T>(key: string, count: number, value: T): Promise<void> {
  const list = (await get<T[]>(key)) ?? [];
  const idx = list.indexOf(value as any);
  if (idx !== -1) list.splice(idx, 1);
  await set(key, list);
}
