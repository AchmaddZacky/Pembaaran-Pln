'use client';

import type { BillingData } from '@/lib/types';
import { formatRupiah, ADMIN_FEE } from '@/lib/utils';
import { Receipt, User, Calendar, CreditCard, ArrowRight, X, FileText } from 'lucide-react';

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
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Detail Tagihan</h2>
              <p className="text-sm text-text-muted mt-0.5">Verifikasi data sebelum pembayaran</p>
            </div>
          </div>
          <div className="text-sm text-text-muted bg-bg-primary px-4 py-2 rounded-lg font-medium">
            {new Date().toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Data Pelanggan */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
            <User size={16} className="text-primary-500" /> Data Pelanggan
          </h3>
          <div className="bg-bg-primary rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">ID Pelanggan (IDPEL)</span>
              <span className="text-base font-mono text-primary-600 font-bold bg-primary-100/50 px-3 py-1 rounded-md">
                {data.pelanggan.idpel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Nama Pelanggan</span>
              <span className="text-base font-semibold text-text-primary">
                {data.pelanggan.nama_pelanggan}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Tarif / Daya</span>
              <span className="text-sm font-medium text-text-secondary">
                {data.pelanggan.tarif_daya}
              </span>
            </div>
          </div>
        </div>

        {/* Data Tagihan */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} className="text-primary-500" /> Rincian Tagihan
          </h3>
          <div className="bg-bg-primary rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Periode</span>
              <span className="text-sm font-medium text-text-primary">
                {data.tagihan.bl_th} ({data.tagihan.periode_label})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Stand Meter</span>
              <span className="text-sm font-mono text-text-secondary">
                {data.tagihan.stand_meter}
              </span>
            </div>
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
            <Receipt size={16} className="text-primary-500" /> Rincian Biaya
          </h3>
          <div className="bg-bg-primary rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Tagihan PLN</span>
              <span className="text-base font-semibold text-text-primary">
                {formatRupiah(rpTagPln)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Biaya Admin POS</span>
              <span className="text-base font-semibold text-text-primary">
                {formatRupiah(ADMIN_FEE)}
              </span>
            </div>
            {nonSubsidi > 0 && (
              <div className="flex justify-between items-center border-t border-border/50 pt-3 mt-1">
                <span className="text-sm text-text-muted">Non Subsidi</span>
                <span className="text-base font-semibold text-text-primary">
                  {formatRupiah(nonSubsidi)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-primary-100 opacity-50">
            <CreditCard size={120} />
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <span className="text-sm font-medium text-primary-700 block mb-1">Total Pembayaran</span>
              <span className="text-4xl font-black text-primary-600 tracking-tight">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={onProceed} className="btn-primary flex-1 text-lg py-4 flex justify-center items-center gap-2 shadow-md hover:shadow-lg">
            Lanjut ke Pembayaran <ArrowRight size={20} />
          </button>
          <button onClick={onCancel} className="btn-secondary px-8 py-4 flex items-center gap-2 border-border text-text-muted hover:text-text-primary">
            <X size={20} /> Batal
          </button>
        </div>

        <p className="text-xs text-center text-text-muted mt-6 flex items-center justify-center gap-1.5">
          Pastikan data sudah benar sebelum melanjutkan pembayaran
        </p>
      </div>
    </div>
  );
}
