import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';
import { Page } from '@/lib/types';

const PAGES_KEY = 'split:pages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pageId = searchParams.get('pageId');
    const token = searchParams.get('token'); // secret token for security

    const TRACKING_SECRET = process.env.TRACKING_SECRET || 'split-track-2024';

    if (!type || !pageId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing type or pageId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Optional: validate secret token for conversions
    if (type === 'conversion' && token !== TRACKING_SECRET) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid tracking token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const idx = pages.findIndex((p) => p.id === pageId);

    if (idx === -1) {
      return new Response(JSON.stringify({ success: false, error: 'Page not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (type === 'visit') {
      pages[idx].visits += 1;
    } else if (type === 'conversion') {
      pages[idx].conversions += 1;
    }

    await kv.set(PAGES_KEY, pages);

    // Return 1x1 transparent pixel for img tag tracking
    return new Response(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
