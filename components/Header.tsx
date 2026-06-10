import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center">
            <Zap size={24} className="fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              PT. POS Indonesia
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Sistem Pembayaran Online Listrik PLN
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
