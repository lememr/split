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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pages = (await kv.get<Page[]>('split:pages')) ?? [];
    const idx = pages.findIndex((p: Page) => p.id === id);
    if (idx === -1) return json({ success: false, error: 'Page not found' }, 404);

    pages[idx] = { ...pages[idx], active: Boolean(body.active) };
    await kv.set('split:pages', pages);
    return json({ success: true, data: pages[idx] });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}
