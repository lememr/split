import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'split2024';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedHash = Buffer.from(ADMIN_PASSWORD).toString('base64');

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieValue = expectedHash;
    const cookie = `split-auth=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
