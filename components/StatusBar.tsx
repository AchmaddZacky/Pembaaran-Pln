'use client';

import { useEffect, useState } from 'react';

interface Props {
  petugas?: { nama_petugas: string } | null;
}

export default function StatusBar({ petugas }: Props) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-secondary border-t border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span>PPOB Kasir v3.0</span>
          {petugas && (
            <span className="text-text-secondary">
              Petugas: <span className="text-success font-medium">{petugas.nama_petugas}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Online</span>
          </div>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
