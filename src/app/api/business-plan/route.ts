import { NextResponse } from 'next/server';
import { getBusinessConfig } from '@/lib/business-plan';

export async function GET() {
  try {
    const config = await getBusinessConfig();
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch business plan' }, { status: 500 });
  }
}
