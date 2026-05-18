import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';
import { Page } from '@/lib/types';

const PAGES_KEY = 'split:pages';
const CONFIG_KEY = 'split:config';

function corsInit(body: BodyInit | null, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(data: unknown, status = 200) {
  return corsInit(JSON.stringify(data), status);
}

export async function GET() {
  try {
    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    return json({ success: true, data: pages });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.name || !body?.url || typeof body?.weight !== 'number') {
      return json({ success: false, error: 'Missing fields: name, url, weight' }, 400);
    }

    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const newPage: Page = {
      id: crypto.randomUUID(),
      name: String(body.name),
      url: String(body.url),
      weight: Number(body.weight),
      visits: 0,
      conversions: 0,
      active: body.active !== false,
      createdAt: new Date().toISOString(),
    };

    pages.push(newPage);
    await kv.set(PAGES_KEY, pages);

    // ensure config exists
    const config = await kv.get<{ mode: string; roundRobinIndex: number }>(CONFIG_KEY);
    if (!config) {
      await kv.set(CONFIG_KEY, { mode: 'round-robin', roundRobinIndex: 0 });
    }

    return json({ success: true, data: newPage }, 201);
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return json({ success: false, error: 'Missing id' }, 400);

    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const filtered = pages.filter((p) => p.id !== id);
    if (filtered.length === pages.length) {
      return json({ success: false, error: 'Page not found' }, 404);
    }

    await kv.set(PAGES_KEY, filtered);
    return json({ success: true, data: { id } });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return json({ success: false, error: 'Missing id' }, 400);

    const body = await request.json();
    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return json({ success: false, error: 'Page not found' }, 404);

    const updated: Page = {
      ...pages[idx],
      name: body.name !== undefined ? String(body.name) : pages[idx].name,
      url: body.url !== undefined ? String(body.url) : pages[idx].url,
      weight: body.weight !== undefined ? Number(body.weight) : pages[idx].weight,
      active: body.active !== undefined ? Boolean(body.active) : pages[idx].active,
    };

    pages[idx] = updated;
    await kv.set(PAGES_KEY, pages);
    return json({ success: true, data: updated });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function OPTIONS() {
  return corsInit(null, 204);
}
