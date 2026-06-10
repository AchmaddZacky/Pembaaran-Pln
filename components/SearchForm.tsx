'use client';

import { useState, useEffect } from 'react';
import type { BillingData } from '@/lib/types';

interface Props {
  onFound: (data: BillingData) => void;
  onLogout: () => void;
  onAdmin: () => void;
}

export default function SearchForm({ onFound, onLogout, onAdmin }: Props) {
  const [idpel, setIdpel] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pelangganList, setPelangganList] = useState<BillingData[]>([]);
  const [paidStatus, setPaidStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadPelanggan();
  }, []);

  const loadPelanggan = async () => {
    try {
      const res = await fetch('/api/pelanggan');
      const data = await res.json();
      
      if (data.success) {
        const list = Object.values(data.data) as BillingData[];
        setPelangganList(list);

        // Check paid status
        const statusMap: Record<number, boolean> = {};
        await Promise.all(
          list.map(async (item) => {
            try {
              const checkRes = await fetch(`/api/transaksi/check-paid/${item.tagihan.id_tagihan}`);
              const checkData = await checkRes.json();
              if (checkData.success) {
                statusMap[item.tagihan.id_tagihan] = checkData.isPaid;
              }
            } catch (err) {
              console.error('Failed to check paid status', err);
            }
          })
        );
        setPaidStatus(statusMap);
      }
    } catch (err) {
      console.error('Failed to load pelanggan', err);
    }
  };

  const handleSearch = async () => {
    setError('');
    
    if (idpel.length !== 12) {
      setError(`IDPEL harus tepat 12 digit. Anda memasukkan ${idpel.length} digit.`);
      return;
    }

    setLoading(true);

    try {
      const found = pelangganList.find((p) => p.pelanggan.idpel === idpel);
      
      if (!found) {
        setError('Data pelanggan tidak ditemukan');
        return;
      }

      const isPaid = paidStatus[found.tagihan.id_tagihan];
      if (isPaid) {
        setError('Tagihan untuk pelanggan ini sudah LUNAS');
        return;
      }

      onFound(found);
    } catch (err) {
      setError('Terjadi kesalahan saat mencari data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Pencarian Data Konsumen
        </h2>
        <div className="flex gap-3">
          <button onClick={onAdmin} className="btn-secondary text-sm px-4 py-2">
            ⚙️ Kelola Data
          </button>
          <button onClick={onLogout} className="btn-secondary text-sm px-4 py-2">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Masukkan Nomor IDPEL (12 Digit)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={idpel}
            onChange={(e) => setIdpel(e.target.value.replace(/\D/g, '').slice(0, 12))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1 text-lg tracking-wider"
            placeholder="____________"
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary px-8"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
        
        <div className="mt-3 text-sm">
          <span className="text-text-muted">Digit terbaca: </span>
          <span className={idpel.length === 12 ? 'text-success font-medium' : 'text-warning'}>
            {idpel.length} / 12
          </span>
        </div>

        {error && (
          <div className="mt-4 bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          IDPEL Terdaftar ({pelangganList.length} konsumen)
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pelangganList.map((item) => {
            const isPaid = paidStatus[item.tagihan.id_tagihan];
            return (
              <div
                key={item.pelanggan.idpel}
                onClick={() => !isPaid && setIdpel(item.pelanggan.idpel)}
                className={`flex items-center justify-between p-3 rounded-lg border border-border hover:bg-bg-card transition-colors ${
                  isPaid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <span className="text-warning font-medium tracking-wider">
                    {item.pelanggan.idpel}
                  </span>
                  <span className="text-text-primary">
                    {item.pelanggan.nama_pelanggan}
                  </span>
                  <span className="text-text-muted text-sm">
                    {item.pelanggan.tarif_daya}
                  </span>
                </div>
                {isPaid && (
                  <span className="text-xs font-semibold text-success border border-success px-3 py-1 rounded-full">
                    ✓ LUNAS
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
