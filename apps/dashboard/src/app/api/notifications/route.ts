import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getLeads } from '@/lib/api/leads';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ data: [], total: 0 }, { status: 401 });

  try {
    const result = await getLeads(session.token, session.tenantId, { status: 'NEW', limit: 10 });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ data: [], total: 0 });
  }
}
