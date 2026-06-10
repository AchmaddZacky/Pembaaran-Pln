import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await query<any[]>(
      `SELECT no_resi, payment_status FROM transaksi 
       WHERE id_tagihan = ? AND payment_status = 'paid'
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      isPaid: results.length > 0,
      transaksi: results[0] || null,
    });
  } catch (error) {
    console.error('Error checking paid status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
