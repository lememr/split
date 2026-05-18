import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';
import { Page, TrackEvent } from '@/lib/types';

const PAGES_KEY = 'split:pages';
const EVENTS_KEY = 'split:events';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TrackEvent>;
    if (!body?.pageId || !body?.type || !['visit', 'conversion'].includes(body.type)) {
      return json({ success: false, error: 'Missing/invalid fields: pageId, type' }, 400);
    }

    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const idx = pages.findIndex((p) => p.id === body.pageId);
    if (idx === -1) {
      return json({ success: false, error: 'Page not found' }, 404);
    }

    if (body.type === 'visit') pages[idx].visits += 1;
    if (body.type === 'conversion') pages[idx].conversions += 1;

    await kv.set(PAGES_KEY, pages);

    const event: TrackEvent = {
      pageId: body.pageId,
      type: body.type,
      timestamp: body.timestamp ?? new Date().toISOString(),
    };
    await kv.lpush(EVENTS_KEY, event);

    return json({ success: true, data: event });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function OPTIONS() {
  return json(null, 204);
}
