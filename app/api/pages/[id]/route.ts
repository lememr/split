import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';
import { Page } from '@/lib/types';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pages = (await kv.get<Page[]>('split:pages')) ?? [];
    const idx = pages.findIndex((p: Page) => p.id === id);
    if (idx === -1) return json({ success: false, error: 'Page not found' }, 404);

    pages[idx] = {
      ...pages[idx],
      name: body.name !== undefined ? String(body.name) : pages[idx].name,
      url: body.url !== undefined ? String(body.url) : pages[idx].url,
      weight: body.weight !== undefined ? Number(body.weight) : pages[idx].weight,
    };
    await kv.set('split:pages', pages);
    return json({ success: true, data: pages[idx] });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pages = (await kv.get<Page[]>('split:pages')) ?? [];
    const filtered = pages.filter((p: Page) => p.id !== id);
    if (filtered.length === pages.length) {
      return json({ success: false, error: 'Page not found' }, 404);
    }
    await kv.set('split:pages', filtered);
    return json({ success: true, data: { id } });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}
