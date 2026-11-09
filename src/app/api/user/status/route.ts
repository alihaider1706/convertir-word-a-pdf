import { NextRequest, NextResponse } from 'next/server';
import { getUserStatus } from '@/lib/usage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = await getUserStatus(request);
  return NextResponse.json({ success: true, ...status });
}
