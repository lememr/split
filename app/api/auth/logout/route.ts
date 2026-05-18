import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const cookie = `split-auth=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
