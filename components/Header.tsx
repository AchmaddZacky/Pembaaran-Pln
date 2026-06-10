export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">📮</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              PT. POS Indonesia
            </h1>
            <p className="text-sm text-primary-100 mt-0.5">
              Sistem Pembayaran Online Listrik PLN
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
