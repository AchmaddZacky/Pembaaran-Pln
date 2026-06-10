import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Transaksi } from '@/lib/types';

export async function GET() {
  try {
    const results = await query<Transaksi[]>(
      `SELECT 
        t.no_resi, t.tanggal_bayar, t.id_petugas, t.id_tagihan,
        t.nurama_ref, t.admin_pos,
        t.total_bayar,
        COALESCE(t.payment_status, 'pending') AS payment_status,
        p.nama_pelanggan, p.idpel,
        tg.bl_th,
        pt.nama_petugas
      FROM transaksi t
      LEFT JOIN tagihan tg ON t.id_tagihan = tg.id_tagihan
      LEFT JOIN pelanggan p ON tg.idpel = p.idpel
      LEFT JOIN petugas pt ON t.id_petugas = pt.id_petugas
      ORDER BY t.tanggal_bayar DESC`
    );
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { no_resi, id_petugas, id_tagihan, nurama_ref, admin_pos, total_bayar, payment_status } = body;

    await query(
      `INSERT INTO transaksi 
        (no_resi, id_petugas, id_tagihan, nurama_ref, admin_pos, total_bayar, payment_status, jumlah_tunai, kembalian, tanggal_bayar) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [no_resi, id_petugas, id_tagihan, nurama_ref, admin_pos, total_bayar, payment_status || 'pending', total_bayar, 0]
    );

    return NextResponse.json({ success: true, message: 'Transaksi created' });
  } catch (error: any) {
    console.error('Error creating transaksi:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
