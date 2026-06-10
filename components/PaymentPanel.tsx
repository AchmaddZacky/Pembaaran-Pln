'use client';

import { useState, useEffect } from 'react';
import type { Petugas, BillingData } from '@/lib/types';
import { formatRupiah, generateResi, generateRefNumara, ADMIN_FEE } from '@/lib/utils';
import { CheckCircle, Printer, RefreshCw, CreditCard, ShieldAlert, User, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    snap: any;
  }
}

interface Props {
  petugas: Petugas;
  data: BillingData;
  onReset: () => void;
  initialSuccess?: boolean;
  initialOrderId?: string;
  initialRefNumara?: string;
}

export default function PaymentPanel({ petugas, data, onReset, initialSuccess = false, initialOrderId = '', initialRefNumara = '' }: Props) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(initialSuccess);
  const [noResi, setNoResi] = useState(initialOrderId);
  const [refNumara, setRefNumara] = useState(initialRefNumara);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Restore refNumara dari database jika redirect
  useEffect(() => {
    if (initialSuccess && initialRefNumara) {
      setRefNumara(initialRefNumara);
    }
  }, [initialSuccess, initialRefNumara]);

  // Jika redirect dari Midtrans dengan status sukses, update tagihan
  useEffect(() => {
    if (initialSuccess && initialOrderId) {
      fetch(`/api/tagihan/${data.tagihan.id_tagihan}/status`, { method: 'PATCH' })
        .catch((err) => console.error('Failed to update tagihan status on redirect:', err));
    }
  }, [initialSuccess, initialOrderId, data.tagihan.id_tagihan]);

  // Ensure numeric values
  const rpTagPln = Number(data.tagihan.rp_tag_pln) || 0;
  const nonSubsidi = Number(data.tagihan.non_subsidi) || 0;
  const totalTagihan = rpTagPln + ADMIN_FEE + nonSubsidi;

  // Load Midtrans Snap script
  useEffect(() => {
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY';

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!snapLoaded) {
      alert('Payment gateway belum siap. Mohon tunggu...');
      return;
    }

    setProcessing(true);

    // Generate transaction numbers
    const resi = generateResi();
    const ref = generateRefNumara();
    
    setNoResi(resi);
    setRefNumara(ref);

    try {
      // Create Midtrans transaction
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: resi,
          grossAmount: totalTagihan,
          customerDetails: {
            first_name: data.pelanggan.nama_pelanggan,
            email: `${data.pelanggan.idpel}@customer.pos.co.id`,
            phone: '08123456789',
          },
          itemDetails: [
            {
              id: 'PLN',
              price: rpTagPln,
              quantity: 1,
              name: `Tagihan PLN ${data.tagihan.bl_th}`,
            },
            {
              id: 'ADMIN',
              price: ADMIN_FEE,
              quantity: 1,
              name: 'Biaya Admin POS',
            },
            ...(nonSubsidi > 0
              ? [
                  {
                    id: 'SUBSIDI',
                    price: nonSubsidi,
                    quantity: 1,
                    name: 'Non Subsidi',
                  },
                ]
              : []),
          ],
        }),
      });

      const result = await response.json();

      if (result.success && result.token) {
        // Open Midtrans Snap popup
        window.snap.pay(result.token, {
          onSuccess: async function (result: any) {
            console.log('Payment success:', result);
            // Save transaction to database
            await saveTransaction(resi, ref, 'paid');
            setSuccess(true);
            setProcessing(false);
          },
          onPending: function (result: any) {
            console.log('Payment pending:', result);
            alert('Pembayaran pending. Silakan selesaikan pembayaran Anda.');
            setProcessing(false);
          },
          onError: function (result: any) {
            console.log('Payment error:', result);
            alert('Pembayaran gagal. Silakan coba lagi.');
            setProcessing(false);
          },
          onClose: function () {
            console.log('Payment popup closed');
            setProcessing(false);
          },
        });
      } else {
        alert('Gagal membuat transaksi. Silakan coba lagi.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Terjadi kesalahan saat memproses pembayaran');
      setProcessing(false);
    }
  };

  const saveTransaction = async (resi: string, ref: string, status: string) => {
    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_resi: resi,
          id_petugas: petugas.id_petugas,
          id_tagihan: data.tagihan.id_tagihan,
          nurama_ref: ref,
          admin_pos: ADMIN_FEE,
          total_bayar: totalTagihan,
          payment_status: status,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Failed to save transaction:', result.message);
      }

      // Update status_bayar di tagihan jika paid
      if (status === 'paid') {
        await fetch(`/api/tagihan/${data.tagihan.id_tagihan}/status`, {
          method: 'PATCH',
        });
      }
    } catch (err) {
      console.error('Failed to save transaction', err);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="card text-center border-t-4 border-t-success pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center">
              <CheckCircle size={48} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-success mb-2">
            Pembayaran Berhasil!
          </h2>
          <p className="text-text-muted mb-8">
            Transaksi telah berhasil diproses dengan aman.
          </p>

          {/* Receipt */}
          <div className="bg-bg-primary border border-border rounded-xl p-8 mb-8 text-left shadow-sm">
            <div className="text-center mb-6 pb-6 border-b border-dashed border-border/70">
              <h3 className="text-lg font-bold text-text-primary mb-1 tracking-widest">BUKTI PEMBAYARAN</h3>
              <p className="text-xs text-text-muted">PT. POS Indonesia - PPOB</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">No. Resi</span>
                <span className="text-sm font-mono font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-md">{noResi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Ref Nurama</span>
                <span className="text-sm font-mono text-text-secondary">{refNumara}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Tanggal</span>
                <span className="text-sm text-text-secondary font-medium">
                  {new Date().toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Petugas</span>
                <span className="text-sm text-text-secondary flex items-center gap-1.5"><User size={14}/> {petugas.nama_petugas}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-border/70 pt-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-muted">IDPEL</span>
                <span className="text-sm font-mono font-bold text-primary-600">{data.pelanggan.idpel}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-muted">Nama</span>
                <span className="text-sm font-semibold text-text-primary">{data.pelanggan.nama_pelanggan}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-muted">Periode</span>
                <span className="text-sm font-medium text-text-secondary">{data.tagihan.bl_th}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-border/70 pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-muted">Tagihan PLN</span>
                <span className="text-sm font-medium text-text-primary">
                  {formatRupiah(rpTagPln)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-muted">Admin POS</span>
                <span className="text-sm font-medium text-text-primary">{formatRupiah(ADMIN_FEE)}</span>
              </div>
              {nonSubsidi > 0 && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-text-muted">Non Subsidi</span>
                  <span className="text-sm font-medium text-text-primary">
                    {formatRupiah(nonSubsidi)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-4 mt-4">
                <span className="text-text-primary">TOTAL</span>
                <span className="text-success text-2xl">{formatRupiah(totalTagihan)}</span>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-dashed border-border/70 flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-success" />
              <p className="text-xs text-text-muted font-medium">
                Simpan bukti ini sebagai tanda pembayaran yang sah
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                const tanggal = new Date().toLocaleString('id-ID', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                }).replace(/\./g, ':');
                const html = `<!DOCTYPE html>
<html><head><title>Struk - ${noResi}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Courier New',monospace; font-size:10px; width:80mm; padding:4mm 5mm; background:white; color:#000; }
.bold { font-weight:bold; }
.center { text-align:center; }
.divider { border-top:1px dashed #000; margin:5px 0; }
.title { text-align:center; font-weight:bold; font-size:11px; margin:6px 0; }
.field { display:flex; gap:2px; margin:2px 0; }
.field .key { min-width:75px; font-weight:bold; }
.note { text-align:center; font-style:italic; margin:6px 0; font-size:9px; line-height:1.5; }
.logo-area { text-align:right; margin-top:8px; }
.logo-area img { width:35px; height:35px; object-fit:contain; }
.logo-area .logo-text { font-weight:bold; font-size:8px; color:#c75000; }
@media print { @page { size:80mm auto; margin:0; } body { padding:3mm 4mm; } }
</style></head>
<body>
<div class="bold">MITRA-01 ${petugas.id_petugas}</div>
<div>Authorized PT.POS INDONESIA (PERSERO)</div>
<div class="divider"></div>
<div>Tanggal : ${tanggal}</div>
<div>No.Resi : ${noResi}</div>
<div>Petugas : ${petugas.id_petugas}</div>
<div class="divider"></div>
<div class="title">STRUK PEMBAYARAN TAGIHAN LISTRIK</div>
<div class="divider"></div>
<div class="field"><span class="key">IDPEL</span><span>: ${data.pelanggan.idpel}</span></div>
<div class="field"><span class="key">NAMA</span><span>: ${data.pelanggan.nama_pelanggan}</span></div>
<div class="field"><span class="key">BL/TH</span><span>: ${data.tagihan.bl_th}</span></div>
<div class="field"><span class="key">TARIF/DAYA</span><span>: ${data.pelanggan.tarif_daya}</span></div>
<div class="field"><span class="key">STAND METER</span><span>: ${data.tagihan.stand_meter}</span></div>
<div class="field"><span class="key">RP TAG PLN</span><span>: Rp. ${rpTagPln.toLocaleString('id-ID')}</span></div>
<div class="field"><span class="key">NON SUBSIDI</span><span>: Rp. ${nonSubsidi.toLocaleString('id-ID')}</span></div>
<div class="field"><span class="key">NURAMA REF</span><span>: ${refNumara}</span></div>
<div class="divider"></div>
<div class="note">PLN menyatakan struk ini sebagai bukti<br>pembayaran yang sah, mohon disimpan</div>
<div class="divider"></div>
<div class="field"><span class="key">ADMIN POS</span><span>: Rp. ${(2500).toLocaleString('id-ID')}</span></div>
<div class="field bold"><span class="key">TOTAL BAYAR</span><span>: Rp. ${totalTagihan.toLocaleString('id-ID')}</span></div>
<div class="divider"></div>
<div style="font-size:8px;color:#555">Rincian tagihan: http://www.pln.co.id</div>
<div class="logo-area">
  <img src="/pos-logo.png" alt="POS" onerror="this.style.display='none'" />
  <div class="logo-text">POS INDONESIA</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
                const win = window.open('', '_blank', 'width=340,height=600');
                if (win) { win.document.write(html); win.document.close(); }
              }}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Printer size={18} /> Cetak Struk
            </button>
            <button onClick={onReset} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              <RefreshCw size={18} /> Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-3 pb-4 border-b border-border">
          <CreditCard className="text-primary-500" size={28} /> Konfirmasi Pembayaran
        </h2>

        <div className="bg-bg-primary border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">ID Pelanggan</p>
              <p className="text-lg font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-md inline-block">
                {data.pelanggan.idpel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text-muted mb-1">Periode</p>
              <p className="text-lg font-bold text-text-primary">
                {data.tagihan.bl_th}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-text-muted mb-1">Nama Pelanggan</p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              {data.pelanggan.nama_pelanggan}
            </p>
          </div>

          <div className="bg-bg-secondary rounded-lg p-5">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-text-muted font-medium">Tagihan PLN</span>
                <span className="text-text-primary font-semibold">
                  {formatRupiah(rpTagPln)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted font-medium">Biaya Admin</span>
                <span className="text-text-primary font-semibold">
                  {formatRupiah(ADMIN_FEE)}
                </span>
              </div>
              {nonSubsidi > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Non Subsidi</span>
                  <span className="text-text-primary font-semibold">
                    {formatRupiah(nonSubsidi)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-5 border-t border-border">
              <span className="text-lg font-bold text-text-primary">Total Bayar</span>
              <span className="text-3xl font-black text-primary-600 tracking-tight">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 mb-8 flex gap-4 items-start">
          <ShieldAlert className="text-warning flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm font-bold text-warning mb-1">Perhatian</p>
            <p className="text-sm text-warning/90 leading-relaxed">
              Pastikan data pelanggan dan jumlah pembayaran sudah benar. 
              Transaksi yang sudah diproses tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePayment}
            disabled={processing || !snapLoaded}
            className="btn-primary flex-1 text-lg py-4 font-bold flex items-center justify-center shadow-md hover:shadow-lg"
          >
            {!snapLoaded ? (
              '⏳ Loading Payment Gateway...'
            ) : processing ? (
              <span className="flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin" size={20} />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard size={22} /> Bayar dengan Midtrans
              </span>
            )}
          </button>
          <button
            onClick={onReset}
            disabled={processing}
            className="btn-secondary px-8 py-4 font-semibold text-text-muted hover:text-text-primary border-border"
          >
            Batal
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-text-muted">
          <span className="flex items-center gap-1.5"><User size={14} /> Petugas: {petugas.nama_petugas}</span>
          <span>{petugas.loket}</span>
        </div>
      </div>
    </div>
  );
}
