'use client';

import { useState, useEffect } from 'react';
import type { BillingData } from '@/lib/types';
import { Search, LogOut, Settings, AlertCircle, CheckCircle2, Users } from 'lucide-react';

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
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Search className="text-primary-500" size={24} />
          Pencarian Data Konsumen
        </h2>
        <div className="flex gap-3">
          <button onClick={onAdmin} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <Settings size={16} /> Kelola Data
          </button>
          <button onClick={onLogout} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 border-danger text-danger hover:bg-danger/10 hover:text-danger">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="card border-l-4 border-l-primary-500">
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Masukkan Nomor IDPEL (12 Digit)
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-text-muted" />
            </div>
            <input
              type="text"
              value={idpel}
              onChange={(e) => setIdpel(e.target.value.replace(/\D/g, '').slice(0, 12))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-12 text-lg tracking-wider"
              placeholder="____________"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {loading ? 'Mencari...' : (
              <>
                <Search size={18} /> Cari
              </>
            )}
          </button>
        </div>
        
        <div className="mt-3 text-sm">
          <span className="text-text-muted">Digit terbaca: </span>
          <span className={idpel.length === 12 ? 'text-success font-medium' : 'text-primary-600 font-medium'}>
            {idpel.length} / 12
          </span>
        </div>

        {error && (
          <div className="mt-4 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Users className="text-primary-500" size={20} />
          IDPEL Terdaftar ({pelangganList.length} konsumen)
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {pelangganList.map((item) => {
            const isPaid = paidStatus[item.tagihan.id_tagihan];
            return (
              <div
                key={item.pelanggan.idpel}
                onClick={() => !isPaid && setIdpel(item.pelanggan.idpel)}
                className={`flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary-300 hover:shadow-sm transition-all bg-bg-secondary ${
                  isPaid ? 'opacity-50 cursor-not-allowed bg-bg-primary' : 'cursor-pointer'
                }`}
              >
                <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                  <span className="text-primary-600 font-semibold tracking-wider text-lg">
                    {item.pelanggan.idpel}
                  </span>
                  <span className="text-text-primary font-medium">
                    {item.pelanggan.nama_pelanggan}
                  </span>
                  <span className="text-text-muted text-sm bg-bg-primary px-3 py-1 rounded-full w-fit">
                    {item.pelanggan.tarif_daya}
                  </span>
                </div>
                {isPaid && (
                  <span className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> LUNAS
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
