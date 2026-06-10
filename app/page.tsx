'use client';

import { useState, useEffect } from 'react';
import type { Petugas, BillingData } from '@/lib/types';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import LoginForm from '@/components/LoginForm';
import SearchForm from '@/components/SearchForm';
import AdminPage from '@/components/AdminPage';
import BillingDetail from '@/components/BillingDetail';
import PaymentPanel from '@/components/PaymentPanel';

type AppPage = 'login' | 'search' | 'billing' | 'payment' | 'admin';

export default function Home() {
  const [page, setPage] = useState<AppPage>('login');
  const [petugas, setPetugas] = useState<Petugas | null>(null);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [redirectSuccess, setRedirectSuccess] = useState(false);
  const [redirectOrderId, setRedirectOrderId] = useState('');
  const [redirectRefNumara, setRedirectRefNumara] = useState('');

  // Load session from localStorage on mount
  useEffect(() => {
    const init = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const transactionStatus = params.get('transaction_status');
      const orderId = params.get('order_id');

      const savedPetugas = localStorage.getItem('petugas');
      const savedBilling = localStorage.getItem('billingData');

      if (!savedPetugas) {
        // No session, clear any stale data
        localStorage.clear();
      } else if (savedPetugas) {
        const parsed = JSON.parse(savedPetugas);
        setPetugas(parsed);

        if (transactionStatus && orderId) {
          // Returning from Midtrans redirect
          if (savedBilling) setBillingData(JSON.parse(savedBilling));

          if (transactionStatus === 'finish' || transactionStatus === 'settlement') {
            setRedirectSuccess(true);
            setRedirectOrderId(orderId);
            // Ambil nurama_ref dari database
            try {
              const res = await fetch(`/api/transaksi/${orderId}`);
              const data = await res.json();
              if (data.success && data.data?.nurama_ref) {
                setRedirectRefNumara(data.data.nurama_ref);
              }
            } catch (e) {}
            setPage('payment');
          } else {
            setPage('search');
          }
          window.history.replaceState({}, '', '/');
        } else {          const savedPage = localStorage.getItem('currentPage') as AppPage;
          const safePage: AppPage =
            savedPage === 'search' || savedPage === 'admin' ? savedPage : 'search';
          setPage(safePage);
        }
      }
    } catch (err) {
      console.error('Failed to load saved session', err);
      localStorage.removeItem('petugas');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('billingData');
      setPage('login');
    } finally {
      setIsLoading(false);
      setMounted(true);
    }
    };
    init();
  }, []);

  // Check API health (non-blocking)
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    fetch('/api/health', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => { setApiStatus(data.status === 'OK' ? 'online' : 'offline'); clearTimeout(timeoutId); })
      .catch(() => { setApiStatus('offline'); clearTimeout(timeoutId); });
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  // Persist session to localStorage
  useEffect(() => {
    if (!mounted) return;
    if (petugas) {
      localStorage.setItem('petugas', JSON.stringify(petugas));
      localStorage.setItem('currentPage', page);
    } else {
      localStorage.removeItem('petugas');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('billingData');
    }
  }, [petugas, page, mounted]);

  const handleLogin = (p: Petugas) => {
    setPetugas(p);
    setPage('search');
  };

  const handleFound = (data: BillingData) => {
    setBillingData(data);
    localStorage.setItem('billingData', JSON.stringify(data));
    setPage('billing');
  };

  const handleLogout = () => {
    localStorage.clear();
    setPetugas(null);
    setBillingData(null);
    setPage('login');
  };

  const handleReset = () => {
    setBillingData(null);
    setRedirectSuccess(false);
    setRedirectOrderId('');
    setRedirectRefNumara('');
    localStorage.removeItem('billingData');
    setPage('search');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-bg-primary">
        {page === 'login' && <LoginForm onLogin={handleLogin} />}
        {page === 'search' && petugas && (
          <SearchForm
            onFound={handleFound}
            onLogout={handleLogout}
            onAdmin={() => setPage('admin')}
          />
        )}
        {page === 'admin' && petugas && (
          <AdminPage onBack={() => setPage('search')} />
        )}
        {page === 'billing' && billingData && (
          <BillingDetail
            data={billingData}
            onProceed={() => setPage('payment')}
            onCancel={() => { setBillingData(null); localStorage.removeItem('billingData'); setPage('search'); }}
          />
        )}
        {page === 'payment' && petugas && billingData && (
          <PaymentPanel
            petugas={petugas}
            data={billingData}
            initialSuccess={redirectSuccess}
            initialOrderId={redirectOrderId}
            initialRefNumara={redirectRefNumara}
            onReset={handleReset}
          />
        )}
      </main>
      <StatusBar petugas={petugas} />
    </div>
  );
}
