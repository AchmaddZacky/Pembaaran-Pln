'use client';

import { useState } from 'react';
import type { Petugas } from '@/lib/types';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';

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
        <div className="card border-t-4 border-t-primary-500">
          <div className="text-center mb-8 mt-2">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Login Petugas
            </h2>
            <p className="text-sm text-text-muted">
              Masukkan kredensial untuk mengakses sistem
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ID Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-text-muted" />
                </div>
                <input
                  type="text"
                  value={idPetugas}
                  onChange={(e) => setIdPetugas(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Masukkan ID Petugas"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-text-muted" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Masukkan Password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading ? 'Memverifikasi...' : (
                <>
                  <LogIn size={18} />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center bg-bg-primary py-2 rounded-md">
              Demo: ID <span className="text-primary-600 font-medium">686026501</span> / 
              Password <span className="text-primary-600 font-medium">1234</span>
            </p>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-xs text-text-muted hover:text-danger transition-colors"
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
