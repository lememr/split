import { put, del, list } from '@vercel/blob';

const STATE_KEY = 'split-state.json';

interface SplitState {
  pages: any[];
  config: { mode: string; roundRobinIndex: number };
}

export async function getState(): Promise<SplitState> {
  try {
    const { blobs } = await list({ prefix: STATE_KEY, limit: 1 });
    if (!blobs || blobs.length === 0) {
      return { pages: [], config: { mode: 'round-robin', roundRobinIndex: 0 } };
    }
    const res = await fetch(blobs[0].url);
    if (!res.ok) throw new Error('Failed to fetch state');
    return await res.json() as SplitState;
  } catch {
    return { pages: [], config: { mode: 'round-robin', roundRobinIndex: 0 } };
  }
}

export async function setState(state: SplitState): Promise<void> {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  await put(STATE_KEY, blob, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// Backward-compatible wrapper mimicking old kv interface
export async function get<T>(key: string): Promise<T | null> {
  const state = await getState();
  if (key === 'split:pages') return state.pages as T;
  if (key === 'split:config') return state.config as T;
  return null;
}

export async function set<T>(key: string, value: T): Promise<void> {
  const state = await getState();
  if (key === 'split:pages') state.pages = value as any[];
  if (key === 'split:config') state.config = value as any;
  await setState(state);
}
