'use client';

import { useState, useEffect } from 'react';
import type { BillingData, Transaksi, PelangganFormData } from '@/lib/types';
import { formatRupiah, TARIF_OPTIONS } from '@/lib/utils';

interface Props {
  onBack: () => void;
}

type AdminTab = 'pelanggan' | 'transaksi';
type CrudMode = 'list' | 'create' | 'edit' | 'detail';

const EMPTY_FORM: PelangganFormData = {
  idpel: '',
  nama_pelanggan: '',
  tarif_daya: 'R1 / 1.300 VA',
  bl_th: '',
  stand_meter: '',
  rp_tag_pln: '',
  non_subsidi: '0',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success border border-success px-2 py-0.5 rounded-full">
        ✓ Lunas
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning border border-warning px-2 py-0.5 rounded-full">
        ⏳ Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger border border-danger px-2 py-0.5 rounded-full">
      ✕ Gagal
    </span>
  );
}

function printStruk(t: Transaksi) {
  const tanggal = new Date(t.tanggal_bayar).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(/\./g, ':');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Struk - ${t.no_resi}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          width: 80mm;
          padding: 4mm 5mm;
          background: white;
          color: #000;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .title { text-align: center; font-weight: bold; font-size: 11px; margin: 6px 0; }
        .field { display: flex; gap: 2px; margin: 2px 0; }
        .field .key { min-width: 75px; font-weight: bold; }
        .note { text-align: center; font-style: italic; margin: 6px 0; font-size: 9px; line-height: 1.5; }
        .logo-area { text-align: right; margin-top: 8px; }
        .logo-area img { width: 35px; height: 35px; object-fit: contain; }
        .logo-area .logo-text { font-weight: bold; font-size: 8px; color: #c75000; }
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { padding: 3mm 4mm; }
        }
      </style>
    </head>
    <body>
      <div class="bold">MITRA-01 ${t.id_petugas}</div>
      <div>Authorized PT.POS INDONESIA (PERSERO)</div>
      <div class="divider"></div>
      <div>Tanggal : ${tanggal}</div>
      <div>No.Resi : ${t.no_resi}</div>
      <div>Petugas : ${t.id_petugas}</div>
      <div class="divider"></div>
      <div class="title">STRUK PEMBAYARAN TAGIHAN LISTRIK</div>
      <div class="divider"></div>
      <div class="field"><span class="key">IDPEL</span><span>: ${t.idpel || '-'}</span></div>
      <div class="field"><span class="key">NAMA</span><span>: ${t.nama_pelanggan || '-'}</span></div>
      <div class="field"><span class="key">BL/TH</span><span>: ${t.bl_th || '-'}</span></div>
      <div class="field"><span class="key">RP TAG PLN</span><span>: Rp. ${(Number(t.total_bayar) - Number(t.admin_pos)).toLocaleString('id-ID')}</span></div>
      <div class="field"><span class="key">NON SUBSIDI</span><span>: Rp. 0</span></div>
      <div class="field"><span class="key">NURAMA REF</span><span>: ${t.nurama_ref}</span></div>
      <div class="divider"></div>
      <div class="note">PLN menyatakan struk ini sebagai bukti<br>pembayaran yang sah, mohon disimpan</div>
      <div class="divider"></div>
      <div class="field"><span class="key">ADMIN POS</span><span>: Rp. ${Number(t.admin_pos).toLocaleString('id-ID')}</span></div>
      <div class="field bold"><span class="key">TOTAL BAYAR</span><span>: Rp. ${Number(t.total_bayar).toLocaleString('id-ID')}</span></div>
      <div class="divider"></div>
      <div style="font-size:8px;color:#555">Rincian tagihan: http://www.pln.co.id</div>
      <div class="logo-area">
        <img src="/pos-logo.png" alt="POS" onerror="this.style.display='none'" />
        <div class="logo-text">POS INDONESIA</div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=340,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function AdminPage({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('pelanggan');
  const [pelangganList, setPelangganList] = useState<BillingData[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [mode, setMode] = useState<CrudMode>('list');
  const [selectedIdpel, setSelectedIdpel] = useState<string | null>(null);
  const [form, setForm] = useState<PelangganFormData>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Transaksi filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pelanggan') {
        const res = await fetch('/api/pelanggan');
        const data = await res.json();
        if (data.success) setPelangganList(Object.values(data.data));
      } else {
        const res = await fetch('/api/transaksi');
        const data = await res.json();
        if (data.success) setTransaksiList(data.data);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPelanggan = pelangganList.filter(
    (d) =>
      d.pelanggan.idpel.includes(searchQuery) ||
      d.pelanggan.nama_pelanggan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransaksi = transaksiList.filter((t) => {
    if (filterStatus !== 'all' && t.payment_status !== filterStatus) return false;
    if (filterDate) {
      const tDate = new Date(t.tanggal_bayar).toISOString().slice(0, 10);
      if (tDate !== filterDate) return false;
    }
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      return (
        t.no_resi.toLowerCase().includes(q) ||
        (t.nama_pelanggan || '').toLowerCase().includes(q) ||
        (t.idpel || '').includes(q)
      );
    }
    return true;
  });

  const [formError, setFormError] = useState('');

  const handleCreate = () => { setForm(EMPTY_FORM); setFormError(''); setMode('create'); setSuccessMsg(''); };
  const handleDetail = (idpel: string) => { setSelectedIdpel(idpel); setMode('detail'); };

  const handleEdit = (idpel: string) => {
    const data = pelangganList.find((p) => p.pelanggan.idpel === idpel);
    if (!data) return;

    let monthValue = '';
    const blth = data.tagihan.bl_th;
    if (blth) {
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      const monthPart = blth.slice(0, 3).toUpperCase();
      const yearPart = blth.slice(3);
      const monthIndex = monthNames.indexOf(monthPart);
      if (monthIndex !== -1 && yearPart) {
        const fullYear = yearPart.length === 2 ? `20${yearPart}` : yearPart;
        const monthNum = String(monthIndex + 1).padStart(2, '0');
        monthValue = `${fullYear}-${monthNum}`;
      }
    }

    setForm({
      idpel: data.pelanggan.idpel,
      nama_pelanggan: data.pelanggan.nama_pelanggan,
      tarif_daya: data.pelanggan.tarif_daya,
      bl_th: monthValue,
      stand_meter: data.tagihan.stand_meter,
      rp_tag_pln: String(data.tagihan.rp_tag_pln),
      non_subsidi: String(data.tagihan.non_subsidi),
    });
    setSelectedIdpel(idpel);
    setMode('edit');
    setFormError('');
    setSuccessMsg('');
  };

  const handleSave = async () => {
    setFormError('');
    if (form.idpel.length !== 12) { setFormError('IDPEL harus tepat 12 digit'); return; }
    if (!form.nama_pelanggan.trim()) { setFormError('Nama pelanggan wajib diisi'); return; }
    if (!form.bl_th) { setFormError('Periode wajib diisi'); return; }
    if (!form.stand_meter.trim()) { setFormError('Stand meter wajib diisi'); return; }
    if (!form.rp_tag_pln || Number(form.rp_tag_pln) <= 0) { setFormError('Tagihan PLN wajib diisi'); return; }

    let finalBlTh = form.bl_th;
    if (form.bl_th.includes('-')) {
      const [year, month] = form.bl_th.split('-');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      const monthIndex = parseInt(month) - 1;
      const shortYear = year.slice(-2);
      finalBlTh = `${monthNames[monthIndex]}${shortYear}`;
    }

    const payload = {
      pelanggan: {
        idpel: form.idpel,
        nama_pelanggan: form.nama_pelanggan.toUpperCase(),
        tarif_daya: form.tarif_daya,
      },
      tagihan: {
        bl_th: finalBlTh.toUpperCase(),
        stand_meter: form.stand_meter,
        rp_tag_pln: Number(form.rp_tag_pln),
        non_subsidi: Number(form.non_subsidi) || 0,
      },
    };

    try {
      if (mode === 'create') {
        const res = await fetch('/api/pelanggan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) { setSuccessMsg('✓ Data pelanggan berhasil ditambahkan'); await loadData(); setMode('list'); }
        else { setFormError(data.message || 'Gagal menyimpan data'); }
      } else if (mode === 'edit' && selectedIdpel) {
        const res = await fetch(`/api/pelanggan/${selectedIdpel}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) { setSuccessMsg('✓ Data pelanggan berhasil diperbarui'); await loadData(); setMode('list'); }
        else { setFormError(data.message || 'Gagal memperbarui data'); }
      }
    } catch (err) {
      setFormError('Gagal terhubung ke server');
    }
  };

  const handleDelete = async (idpel: string) => {
    try {
      const res = await fetch(`/api/pelanggan/${idpel}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`✓ Data IDPEL ${idpel} berhasil dihapus`);
        setConfirmDelete(null);
        await loadData();
      }
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const selectedData = selectedIdpel ? pelangganList.find((p) => p.pelanggan.idpel === selectedIdpel) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Kelola Data</h2>
          <p className="text-sm text-text-muted mt-1">Manajemen pelanggan dan transaksi</p>
        </div>
        <button onClick={onBack} className="btn-secondary">← Kembali</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(['pelanggan', 'transaksi'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab === 'pelanggan' ? 'Data Pelanggan' : 'Riwayat Transaksi'}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="mb-6 bg-success/10 border border-success text-success px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-lg font-bold">×</button>
        </div>
      )}

      {confirmDelete && (
        <div className="mb-6 card border-danger">
          <p className="text-danger font-semibold mb-2">⚠️ Konfirmasi Hapus</p>
          <p className="text-text-muted text-sm mb-4">
            Hapus pelanggan dengan IDPEL <strong>{confirmDelete}</strong>? Data tidak dapat dikembalikan.
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/80 transition-colors">
              Ya, Hapus
            </button>
            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Batal</button>
          </div>
        </div>
      )}

      {/* Pelanggan Tab - List */}
      {activeTab === 'pelanggan' && mode === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari IDPEL atau nama..."
                className="input-field max-w-md"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="btn-secondary px-4">✕</button>
              )}
            </div>
            <button onClick={handleCreate} className="btn-primary">+ Tambah Pelanggan</button>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">NO</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">IDPEL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">NAMA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">TARIF/DAYA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">PERIODE</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-muted">TAGIHAN</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-muted">STATUS</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-muted">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredPelanggan.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-text-muted">Tidak ada data ditemukan</td></tr>
                ) : (
                  filteredPelanggan.map((item, idx) => (
                    <tr key={item.pelanggan.idpel} className="border-b border-border hover:bg-bg-card">
                      <td className="py-3 px-4 text-sm text-text-muted">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-mono text-warning">{item.pelanggan.idpel}</td>
                      <td className="py-3 px-4 text-sm text-text-primary">{item.pelanggan.nama_pelanggan}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{item.pelanggan.tarif_daya}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{item.tagihan.bl_th}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-warning">{formatRupiah(item.tagihan.rp_tag_pln)}</td>
                      <td className="py-3 px-4 text-center">
                        {item.tagihan.status_bayar === 'SUDAH_BAYAR' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success border border-success px-2 py-0.5 rounded-full">✓ Lunas</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning border border-warning px-2 py-0.5 rounded-full">⏳ Belum Bayar</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleDetail(item.pelanggan.idpel)} className="text-xs px-3 py-1 bg-primary-500/10 text-primary-500 rounded hover:bg-primary-500/20 transition-colors">Lihat</button>
                          <button onClick={() => handleEdit(item.pelanggan.idpel)} className="text-xs px-3 py-1 bg-success/10 text-success rounded hover:bg-success/20 transition-colors">Edit</button>
                          <button onClick={() => setConfirmDelete(item.pelanggan.idpel)} className="text-xs px-3 py-1 bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Create/Edit */}
      {activeTab === 'pelanggan' && (mode === 'create' || mode === 'edit') && (
        <div className="card max-w-3xl">
          <h3 className="text-xl font-semibold mb-6 text-text-primary">
            {mode === 'create' ? 'Tambah Pelanggan Baru' : `Edit Pelanggan - ${selectedIdpel}`}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {formError && (
              <div className="col-span-2 bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                ⚠️ {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">IDPEL (12 Digit) *</label>
              <input type="text" maxLength={12} value={form.idpel}
                onChange={(e) => setForm({ ...form, idpel: e.target.value.replace(/\D/g, '') })}
                disabled={mode === 'edit'} className="input-field" placeholder="____________" />
              <p className="text-xs text-text-muted mt-1">{form.idpel.length} / 12 digit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Nama Pelanggan *</label>
              <input type="text" value={form.nama_pelanggan}
                onChange={(e) => setForm({ ...form, nama_pelanggan: e.target.value })}
                className="input-field" placeholder="Nama lengkap..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tarif / Daya</label>
              <select value={form.tarif_daya} onChange={(e) => setForm({ ...form, tarif_daya: e.target.value })} className="input-field">
                {TARIF_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Periode (BL/TH) *</label>
              <input type="month" value={form.bl_th}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const [year, month] = value.split('-');
                    const monthNamesFull = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                    const label = `${monthNamesFull[parseInt(month) - 1]} ${year}`;
                    setForm({ ...form, bl_th: value });
                  }
                }}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Stand Meter *</label>
              <input type="text" value={form.stand_meter} onChange={(e) => setForm({ ...form, stand_meter: e.target.value })} className="input-field" placeholder="01136700 - 01150400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tagihan PLN (Rp) *</label>
              <input type="text" value={form.rp_tag_pln}
                onChange={(e) => setForm({ ...form, rp_tag_pln: e.target.value.replace(/\D/g, '') })}
                className="input-field" placeholder="116477" />
              {form.rp_tag_pln && <p className="text-xs text-success mt-1">= {formatRupiah(Number(form.rp_tag_pln))}</p>}
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={handleSave} className="btn-primary">✓ Simpan</button>
            <button onClick={() => setMode('list')} className="btn-secondary">Batal</button>
          </div>
        </div>
      )}

      {/* Detail View */}
      {activeTab === 'pelanggan' && mode === 'detail' && selectedData && (
        <div className="card max-w-2xl">
          <h3 className="text-xl font-semibold mb-6 text-text-primary">Detail Pelanggan</h3>
          <div className="space-y-4">
            {[
              { label: 'IDPEL', value: selectedData.pelanggan.idpel },
              { label: 'Nama', value: selectedData.pelanggan.nama_pelanggan },
              { label: 'Tarif/Daya', value: selectedData.pelanggan.tarif_daya },
              { label: 'Periode', value: selectedData.tagihan.bl_th },
              { label: 'Stand Meter', value: selectedData.tagihan.stand_meter },
              { label: 'Tagihan PLN', value: formatRupiah(selectedData.tagihan.rp_tag_pln) },
              { label: 'Admin POS', value: formatRupiah(2500) },
              { label: 'Total', value: formatRupiah(selectedData.tagihan.rp_tag_pln + 2500), highlight: true },
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-text-muted">{row.label}</span>
                <span className={`text-sm font-semibold ${row.highlight ? 'text-warning text-lg' : 'text-text-primary'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => handleEdit(selectedIdpel!)} className="btn-primary">Edit</button>
            <button onClick={() => setMode('list')} className="btn-secondary">Kembali</button>
          </div>
        </div>
      )}

      {/* Transaksi Tab */}
      {activeTab === 'transaksi' && (
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-text-muted mb-1">Cari No. Resi / Nama / IDPEL</label>
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Cari..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="input-field"
                >
                  <option value="all">Semua Status</option>
                  <option value="paid">Lunas</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Gagal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Tanggal</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input-field"
                />
              </div>
              {(filterSearch || filterStatus !== 'all' || filterDate) && (
                <button
                  onClick={() => { setFilterSearch(''); setFilterStatus('all'); setFilterDate(''); }}
                  className="btn-secondary px-4"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Riwayat Transaksi
                <span className="ml-2 text-sm font-normal text-text-muted">
                  ({filteredTransaksi.length} dari {transaksiList.length})
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 text-text-muted">Memuat data...</div>
            ) : filteredTransaksi.length === 0 ? (
              <div className="text-center py-12 text-text-muted">Tidak ada transaksi ditemukan</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">NO RESI</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">TANGGAL</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">PELANGGAN</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">PERIODE</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">PETUGAS</th>
                    <th className="text-right py-3 px-3 text-sm font-semibold text-text-muted">TOTAL</th>
                    <th className="text-center py-3 px-3 text-sm font-semibold text-text-muted">STATUS</th>
                    <th className="text-center py-3 px-3 text-sm font-semibold text-text-muted">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransaksi.map((t) => (
                    <tr key={t.no_resi} className="border-b border-border hover:bg-bg-card">
                      <td className="py-3 px-3 text-xs font-mono text-primary-500">{t.no_resi}</td>
                      <td className="py-3 px-3 text-xs text-text-secondary">
                        {new Date(t.tanggal_bayar).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-text-primary font-medium">{t.nama_pelanggan || '-'}</div>
                        <div className="text-xs text-text-muted font-mono">{t.idpel || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-text-secondary">{t.bl_th || '-'}</td>
                      <td className="py-3 px-3 text-xs text-text-secondary">{t.nama_petugas || t.id_petugas}</td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-success">{formatRupiah(t.total_bayar)}</td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={t.payment_status || 'pending'} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedTransaksi(t)}
                            className="text-xs px-3 py-1 bg-primary-500/10 text-primary-500 rounded hover:bg-primary-500/20 transition-colors"
                          >
                            Detail
                          </button>
                          {t.payment_status === 'paid' && (
                            <button
                              onClick={() => printStruk(t)}
                              className="text-xs px-3 py-1 bg-success/10 text-success rounded hover:bg-success/20 transition-colors"
                            >
                              🖨️ Struk
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {selectedTransaksi && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary">Detail Transaksi</h3>
              <button onClick={() => setSelectedTransaksi(null)} className="text-text-muted hover:text-danger text-xl font-bold">×</button>
            </div>
            <div className="px-6 py-4 space-y-1">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">No. Resi</span>
                <span className="text-sm font-mono font-bold text-primary-500">{selectedTransaksi.no_resi}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Ref Nurama</span>
                <span className="text-sm font-mono text-text-secondary">{selectedTransaksi.nurama_ref}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Tanggal</span>
                <span className="text-sm text-text-primary">{new Date(selectedTransaksi.tanggal_bayar).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Status</span>
                <StatusBadge status={selectedTransaksi.payment_status || 'pending'} />
              </div>
              <div className="text-xs text-text-muted pt-3 pb-1">Data Pelanggan</div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">IDPEL</span>
                <span className="text-sm font-mono text-warning">{selectedTransaksi.idpel || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Nama</span>
                <span className="text-sm text-text-primary">{selectedTransaksi.nama_pelanggan || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Periode</span>
                <span className="text-sm text-text-primary">{selectedTransaksi.bl_th || '-'}</span>
              </div>
              <div className="text-xs text-text-muted pt-3 pb-1">Pembayaran</div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Petugas</span>
                <span className="text-sm text-text-primary">{selectedTransaksi.nama_petugas || selectedTransaksi.id_petugas}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-text-muted">Admin POS</span>
                <span className="text-sm text-text-primary">{formatRupiah(selectedTransaksi.admin_pos)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-text-primary">Total Bayar</span>
                <span className="text-lg font-bold text-success">{formatRupiah(selectedTransaksi.total_bayar)}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3">
              {selectedTransaksi.payment_status === 'paid' && (
                <button onClick={() => printStruk(selectedTransaksi)} className="btn-primary flex-1">
                  🖨️ Cetak Struk
                </button>
              )}
              <button onClick={() => setSelectedTransaksi(null)} className="btn-secondary flex-1">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
