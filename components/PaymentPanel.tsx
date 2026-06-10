'use client';

import { useState, useEffect } from 'react';
import type { Petugas, BillingData } from '@/lib/types';
import { formatRupiah, generateResi, generateRefNumara, ADMIN_FEE } from '@/lib/utils';

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
}

export default function PaymentPanel({ petugas, data, onReset, initialSuccess = false, initialOrderId = '' }: Props) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(initialSuccess);
  const [noResi, setNoResi] = useState(initialOrderId);
  const [refNumara, setRefNumara] = useState('');
  const [snapLoaded, setSnapLoaded] = useState(false);

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
        <div className="card text-center">
          <div className="text-6xl mb-6">✅</div>
          
          <h2 className="text-3xl font-bold text-success mb-2">
            Pembayaran Berhasil!
          </h2>
          <p className="text-text-muted mb-8">
            Transaksi telah berhasil diproses
          </p>

          {/* Receipt */}
          <div className="bg-bg-card border border-border rounded-lg p-6 mb-6 text-left">
            <div className="text-center mb-6 pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary mb-1">BUKTI PEMBAYARAN</h3>
              <p className="text-xs text-text-muted">PT. POS Indonesia - PPOB</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">No. Resi</span>
                <span className="text-sm font-mono font-semibold text-primary-500">{noResi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Ref Nurama</span>
                <span className="text-sm font-mono text-text-secondary">{refNumara}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Tanggal</span>
                <span className="text-sm text-text-secondary">
                  {new Date().toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Petugas</span>
                <span className="text-sm text-text-secondary">{petugas.nama_petugas}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-muted">IDPEL</span>
                <span className="text-sm font-mono text-warning">{data.pelanggan.idpel}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-text-muted">Nama</span>
                <span className="text-sm text-text-primary">{data.pelanggan.nama_pelanggan}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-muted">Periode</span>
                <span className="text-sm text-text-secondary">{data.tagihan.bl_th}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-muted">Tagihan PLN</span>
                <span className="text-sm text-text-primary">
                  {formatRupiah(rpTagPln)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-muted">Admin POS</span>
                <span className="text-sm text-text-primary">{formatRupiah(ADMIN_FEE)}</span>
              </div>
              {nonSubsidi > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-text-muted">Non Subsidi</span>
                  <span className="text-sm text-text-primary">
                    {formatRupiah(nonSubsidi)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-3">
                <span className="text-text-primary">TOTAL</span>
                <span className="text-success">{formatRupiah(totalTagihan)}</span>
              </div>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-xs text-text-muted">
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
              className="btn-secondary flex-1"
            >
              🖨️ Cetak Struk
            </button>
            <button onClick={onReset} className="btn-primary flex-1">
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Konfirmasi Pembayaran
        </h2>

        <div className="bg-bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-text-muted mb-1">ID Pelanggan</p>
              <p className="text-lg font-mono font-semibold text-warning">
                {data.pelanggan.idpel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Periode</p>
              <p className="text-lg font-semibold text-text-primary">
                {data.tagihan.bl_th}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-text-muted mb-1">Nama Pelanggan</p>
            <p className="text-xl font-semibold text-text-primary">
              {data.pelanggan.nama_pelanggan}
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Tagihan PLN</span>
                <span className="text-text-primary font-semibold">
                  {formatRupiah(rpTagPln)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Biaya Admin</span>
                <span className="text-text-primary font-semibold">
                  {formatRupiah(ADMIN_FEE)}
                </span>
              </div>
              {nonSubsidi > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Non Subsidi</span>
                  <span className="text-text-primary font-semibold">
                    {formatRupiah(nonSubsidi)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-4 border-t-2 border-primary-500">
              <span className="text-xl font-bold text-text-primary">Total Bayar</span>
              <span className="text-3xl font-bold text-primary-500">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning mb-1">Perhatian</p>
              <p className="text-xs text-text-muted">
                Pastikan data pelanggan dan jumlah pembayaran sudah benar. 
                Transaksi yang sudah diproses tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePayment}
            disabled={processing || !snapLoaded}
            className="btn-primary flex-1 text-lg py-4"
          >
            {!snapLoaded ? (
              '⏳ Loading Payment Gateway...'
            ) : processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              '💳 Bayar dengan Midtrans'
            )}
          </button>
          <button
            onClick={onReset}
            disabled={processing}
            className="btn-secondary px-8 py-4"
          >
            Batal
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-text-muted">
          <span>Petugas: {petugas.nama_petugas}</span>
          <span>{petugas.loket}</span>
        </div>
      </div>
    </div>
  );
}
