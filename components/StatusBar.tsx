'use client';

import { useEffect, useState } from 'react';
import { Terminal, User, Wifi, Clock } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-muted font-medium">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Terminal size={14} className="text-primary-500" /> PPOB Kasir v3.0</span>
          {petugas && (
            <span className="flex items-center gap-1.5 text-text-secondary">
              <User size={14} className="text-primary-500" />
              Petugas: <span className="text-primary-600 font-semibold">{petugas.nama_petugas}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Wifi size={14} className="text-success" />
            <span className="text-success font-medium">Online</span>
          </div>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-primary-500" /> {time}
          </span>
        </div>
      </div>
    </div>
  );
}
