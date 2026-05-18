import * as kv from '@/lib/kv';
import { Page, Stats } from '@/lib/types';

const PAGES_KEY = 'split:pages';

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

export async function GET() {
  try {
    const pages = (await kv.get<Page[]>(PAGES_KEY)) ?? [];
    const totalPages = pages.length;
    const totalVisits = pages.reduce((sum, p) => sum + (p.visits || 0), 0);
    const totalConversions = pages.reduce((sum, p) => sum + (p.conversions || 0), 0);
    const avgConversionRate = totalVisits > 0 ? totalConversions / totalVisits : 0;

    const stats: Stats = {
      totalPages,
      totalVisits,
      totalConversions,
      avgConversionRate: Number(avgConversionRate.toFixed(4)),
      pages,
    };

    return json({ success: true, data: stats });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function OPTIONS() {
  return json(null, 204);
}
