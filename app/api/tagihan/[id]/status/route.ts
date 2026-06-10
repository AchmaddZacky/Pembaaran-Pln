import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query(
      "UPDATE tagihan SET status_bayar = 'SUDAH_BAYAR' WHERE id_tagihan = ?",
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating tagihan status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
