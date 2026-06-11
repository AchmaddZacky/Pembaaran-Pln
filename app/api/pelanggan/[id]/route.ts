import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { BillingData, Pelanggan, Tagihan } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pelangganRows = await query<Pelanggan[]>(
      'SELECT * FROM pelanggan WHERE idpel = ?',
      [id]
    );
    
    if (pelangganRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pelanggan not found' },
        { status: 404 }
      );
    }

    const tagihanRows = await query<Tagihan[]>(
      'SELECT * FROM tagihan WHERE idpel = ?',
      [id]
    );

    const data: BillingData = {
      pelanggan: pelangganRows[0],
      tagihan: tagihanRows[0],
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pelanggan:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pelanggan, tagihan } = body;

    await query(
      'UPDATE pelanggan SET nama_pelanggan = ?, tarif_daya = ? WHERE idpel = ?',
      [pelanggan.nama_pelanggan, pelanggan.tarif_daya, id]
    );

    await query(
      'UPDATE tagihan SET bl_th = ?, stand_meter = ?, rp_tag_pln = ?, non_subsidi = ? WHERE idpel = ?',
      [
        tagihan.bl_th,
        tagihan.stand_meter,
        tagihan.rp_tag_pln,
        tagihan.non_subsidi,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Pelanggan updated' });
  } catch (error) {
    console.error('Error updating pelanggan:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Hapus transaksi dulu (FK ke tagihan)
    await query(
      'DELETE tr FROM transaksi tr JOIN tagihan tg ON tr.id_tagihan = tg.id_tagihan WHERE tg.idpel = ?',
      [id]
    );

    // Hapus tagihan (FK ke pelanggan)
    await query('DELETE FROM tagihan WHERE idpel = ?', [id]);

    // Hapus pelanggan
    await query('DELETE FROM pelanggan WHERE idpel = ?', [id]);

    return NextResponse.json({ success: true, message: 'Pelanggan deleted' });
  } catch (error: any) {
    console.error('Error deleting pelanggan:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
