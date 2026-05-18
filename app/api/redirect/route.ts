import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';
import { Page, Config } from '@/lib/types';

const PAGES_KEY = 'split:pages';
const CONFIG_KEY = 'split:config';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function weightedRandom(pages: Page[]): Page | null {
  const activePages = pages.filter((p) => p.active);
  if (activePages.length === 0) return null;

  const totalWeight = activePages.reduce((sum, p) => sum + (p.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const page of activePages) {
    random -= page.weight || 1;
    if (random <= 0) return page;
  }

  return activePages[activePages.length - 1];
}

function roundRobin(pages: Page[], index: number): { page: Page | null; nextIndex: number } {
  const activePages = pages.filter((p) => p.active);
  if (activePages.length === 0) return { page: null, nextIndex: index };

  const normalizedIndex = index % activePages.length;
  const nextIndex = (normalizedIndex + 1) % activePages.length;
  return { page: activePages[normalizedIndex], nextIndex };
}

export async function GET(request: NextRequest) {
  try {
    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    if (pages.length === 0) {
      return json({ success: false, error: 'No pages configured' }, 404);
    }

    const activePages = pages.filter((p) => p.active);
    if (activePages.length === 0) {
      return json({ success: false, error: 'No active pages' }, 404);
    }

    let rawConfig: any = (await kv.get(CONFIG_KEY)) ?? {};
    // Suporta tanto mode: 'weighted' quanto legado modo: 'peso'
    let mode: string = rawConfig.mode ?? (rawConfig as any).modo ?? 'round-robin';
    if (mode === 'peso') mode = 'weighted';
    if (!['weighted', 'round-robin'].includes(mode)) mode = 'round-robin';

    let config: Config = {
      mode: mode as 'weighted' | 'round-robin',
      roundRobinIndex: rawConfig.roundRobinIndex ?? 0,
    };

    let selectedPage: Page | null = null;

    if (config.mode === 'weighted') {
      selectedPage = weightedRandom(pages);
    } else {
      const result = roundRobin(pages, config.roundRobinIndex || 0);
      selectedPage = result.page;
      config.roundRobinIndex = result.nextIndex;
    }

    if (!selectedPage) {
      return json({ success: false, error: 'Could not select page' }, 500);
    }

    // increment visits
    const idx = pages.findIndex((p) => p.id === selectedPage!.id);
    if (idx !== -1) {
      pages[idx].visits += 1;
      await kv.set(PAGES_KEY, pages);
    }

    await kv.set(CONFIG_KEY, config);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': selectedPage.url,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function OPTIONS() {
  return json(null, 204);
}
