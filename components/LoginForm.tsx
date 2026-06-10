'use client';

import { useState } from 'react';
import type { Petugas } from '@/lib/types';

interface Props {
  onLogin: (petugas: Petugas) => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [idPetugas, setIdPetugas] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!idPetugas || !password) {
      setError('ID Petugas dan Password wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/petugas/${idPetugas}`);
      const data = await res.json();

      if (data.success && password === '1234') {
        onLogin(data.data);
      } else {
        setError('ID Petugas atau Password tidak valid');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Login Petugas
            </h2>
            <p className="text-sm text-text-muted">
              Masukkan kredensial untuk mengakses sistem
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ID Petugas
              </label>
              <input
                type="text"
                value={idPetugas}
                onChange={(e) => setIdPetugas(e.target.value)}
                className="input-field"
                placeholder="Masukkan ID Petugas"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Masukkan Password"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              Demo: ID <span className="text-warning font-medium">686026501</span> / 
              Password <span className="text-warning font-medium">1234</span>
            </p>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-xs text-text-muted underline hover:text-danger"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
