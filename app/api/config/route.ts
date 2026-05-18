import { NextRequest } from 'next/server';
import * as kv from '@/lib/kv';

const CONFIG_KEY = 'split:config';

export async function GET() {
  try {
    const config = await kv.get(CONFIG_KEY);
    return new Response(JSON.stringify({ success: true, data: config ?? {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // merge with existing
    const existing = (await kv.get(CONFIG_KEY)) ?? {};
    const merged = { ...existing, ...body };
    await kv.set(CONFIG_KEY, merged);
    return new Response(JSON.stringify({ success: true, data: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
