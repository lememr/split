import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';

const CONFIG_KEY = 'split:config';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

/** Normaliza valores PT->EN do frontend */
function normalizeConfig(raw: any) {
  const conf = { ...(raw ?? {}) };
  const rawMode = String(conf.mode ?? conf.modo ?? 'round-robin').toLowerCase();
  if (rawMode === 'peso') conf.mode = 'weighted';
  else if (rawMode === 'weighted') conf.mode = 'weighted';
  else conf.mode = 'round-robin';
  delete conf.modo; // remove legado
  return conf;
}

export async function GET() {
  try {
    const config = await kv.get(CONFIG_KEY);
    return json({ success: true, data: normalizeConfig(config) });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = (await kv.get(CONFIG_KEY)) ?? {};
    const merged = { ...existing, ...body };
    const normalized = normalizeConfig(merged);
    await kv.set(CONFIG_KEY, normalized);
    return json({ success: true, data: normalized });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
