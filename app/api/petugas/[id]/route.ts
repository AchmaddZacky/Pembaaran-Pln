import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Petugas } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await query<Petugas[]>(
      'SELECT * FROM petugas WHERE id_petugas = ?',
      [id]
    );

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Petugas not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: results[0] });
  } catch (error) {
    console.error('Error fetching petugas:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
