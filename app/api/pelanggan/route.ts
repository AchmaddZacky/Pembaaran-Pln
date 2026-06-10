import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Pelanggan, Tagihan, BillingData } from '@/lib/types';

export async function GET() {
  try {
    const pelangganRows = await query<Pelanggan[]>('SELECT * FROM pelanggan');
    const tagihanRows = await query<Tagihan[]>('SELECT * FROM tagihan');

    const db: Record<string, BillingData> = {};

    pelangganRows.forEach((p) => {
      const tagihan = tagihanRows.find((t) => t.idpel === p.idpel);
      if (tagihan) {
        // Ensure numeric values
        db[p.idpel] = {
          pelanggan: p,
          tagihan: {
            ...tagihan,
            rp_tag_pln: Number(tagihan.rp_tag_pln) || 0,
            non_subsidi: Number(tagihan.non_subsidi) || 0,
          },
        };
      }
    });

    return NextResponse.json({ success: true, data: db });
  } catch (error) {
    console.error('Error fetching pelanggan:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pelanggan, tagihan } = body;

    await query('INSERT INTO pelanggan (idpel, nama_pelanggan, tarif_daya) VALUES (?, ?, ?)', [
      pelanggan.idpel,
      pelanggan.nama_pelanggan,
      pelanggan.tarif_daya,
    ]);

    await query(
      'INSERT INTO tagihan (idpel, bl_th, stand_meter, rp_tag_pln, non_subsidi) VALUES (?, ?, ?, ?, ?)',
      [
        pelanggan.idpel,
        tagihan.bl_th,
        tagihan.stand_meter,
        tagihan.rp_tag_pln,
        tagihan.non_subsidi,
      ]
    );

    return NextResponse.json({ success: true, message: 'Pelanggan created' });
  } catch (error: any) {
    console.error('Error creating pelanggan:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
