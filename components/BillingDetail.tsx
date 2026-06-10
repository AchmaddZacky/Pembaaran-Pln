'use client';

import type { BillingData } from '@/lib/types';
import { formatRupiah, ADMIN_FEE } from '@/lib/utils';

interface Props {
  data: BillingData;
  onProceed: () => void;
  onCancel: () => void;
}

export default function BillingDetail({ data, onProceed, onCancel }: Props) {
  // Ensure numeric values
  const rpTagPln = Number(data.tagihan.rp_tag_pln) || 0;
  const nonSubsidi = Number(data.tagihan.non_subsidi) || 0;
  const totalTagihan = rpTagPln + ADMIN_FEE + nonSubsidi;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Detail Tagihan</h2>
            <p className="text-sm text-text-muted mt-1">Verifikasi data sebelum pembayaran</p>
          </div>
          <div className="text-xs text-text-muted">
            {new Date().toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Data Pelanggan */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">
            Data Pelanggan
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">ID Pelanggan (IDPEL)</span>
              <span className="text-sm font-mono text-warning font-semibold">
                {data.pelanggan.idpel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Nama Pelanggan</span>
              <span className="text-sm font-semibold text-text-primary">
                {data.pelanggan.nama_pelanggan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Tarif / Daya</span>
              <span className="text-sm text-text-secondary">
                {data.pelanggan.tarif_daya}
              </span>
            </div>
          </div>
        </div>

        {/* Data Tagihan */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">
            Rincian Tagihan
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Periode</span>
              <span className="text-sm text-text-primary">
                {data.tagihan.bl_th} ({data.tagihan.periode_label})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Stand Meter</span>
              <span className="text-sm font-mono text-text-secondary">
                {data.tagihan.stand_meter}
              </span>
            </div>
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">
            Rincian Biaya
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Tagihan PLN</span>
              <span className="text-base font-semibold text-text-primary">
                {formatRupiah(rpTagPln)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Biaya Admin POS</span>
              <span className="text-base font-semibold text-text-primary">
                {formatRupiah(ADMIN_FEE)}
              </span>
            </div>
            {nonSubsidi > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-muted">Non Subsidi</span>
                <span className="text-base font-semibold text-text-primary">
                  {formatRupiah(nonSubsidi)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-primary-500/10 border-2 border-primary-500 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-text-muted block mb-1">Total Pembayaran</span>
              <span className="text-3xl font-bold text-primary-500">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
            <div className="text-5xl">💳</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={onProceed} className="btn-primary flex-1 text-lg py-4">
            Lanjut ke Pembayaran →
          </button>
          <button onClick={onCancel} className="btn-secondary px-8 py-4">
            Batal
          </button>
        </div>

        <p className="text-xs text-center text-text-muted mt-6">
          Pastikan data sudah benar sebelum melanjutkan pembayaran
        </p>
      </div>
    </div>
  );
}
