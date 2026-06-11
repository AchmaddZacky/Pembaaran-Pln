# Project Documentation: PPOB Kasir PT. POS Indonesia

Dokumentasi ini merangkum aspek rekayasa (engineering), arsitektur, aturan pengkodean, sistem desain, dan keputusan desain dari proyek **PPOB Kasir - Next.js Version**.

---

## 1. Engineering (Rekayasa)

Proyek ini telah dimigrasi dari arsitektur Vite + React + Express terpisah menjadi satu kesatuan **Full-stack Next.js**.

### Technology Stack
- **Framework Utama:** Next.js 15 (App Router)
- **Frontend Library:** React 19
- **Bahasa Pemrograman:** TypeScript (Strict Type-Safe)
- **Styling:** Tailwind CSS & PostCSS
- **Database:** MySQL (dengan driver `mysql2`)
- **Iconography:** `lucide-react`
- **Payment Gateway:** `midtrans-client`

### Development Workflow
- **Development Server:** `npm run dev` (berjalan di port 3000)
- **Production Build:** `npm run build`
- **Start Production:** `npm start`
- **Linter:** `npm run lint` (ESLint)

### Database Setup
Database diinisialisasi menggunakan MySQL. Kredensial koneksi diatur melalui file environment `.env.local`. Skema database dapat direferensikan pada `backend/scripts/schema.sql` (bawaan dari versi lama).

---

## 2. Architecture (Arsitektur)

Sistem menggunakan arsitektur **Full-stack Monolith** menggunakan Next.js App Router. Tidak ada lagi pemisahan port antara frontend dan backend.

### Struktur Direktori Utama
```
ppob-kasir/
├── app/
│   ├── api/              # Backend API routes (Serverless Functions)
│   │   ├── health/       # Health check API
│   │   ├── pelanggan/    # CRUD Pelanggan
│   │   ├── petugas/      # Autentikasi / Data Petugas
│   │   └── transaksi/    # Proses Pembayaran
│   ├── globals.css       # Global styles Next.js
│   ├── layout.tsx        # Root layout (HTML wrapper)
│   └── page.tsx          # Halaman Utama (Home page)
├── components/           # Reusable React Components (Header, StatusBar, LoginForm, SearchForm)
├── lib/                  # Utilities dan Core Logic
│   ├── db.ts             # Koneksi Database MySQL
│   ├── types.ts          # Definisi TypeScript Interfaces/Types
│   └── utils.ts          # Helper functions (Format Rupiah, dll)
├── public/               # Static assets (Images, Fonts)
└── tailwind.config.ts    # Konfigurasi Tema Tailwind
```

### Data Flow
1. **Client** melakukan interaksi melalui komponen React (contoh: `SearchForm.tsx`).
2. **Fetch Request** dikirimkan ke Next.js API Routes (`/api/...`).
3. **API Route** melakukan verifikasi dan memanggil `lib/db.ts`.
4. **Database (MySQL)** mengeksekusi query dan mengembalikan hasil ke API.
5. **API Route** mengirim respon JSON kembali ke Client.

---

## 3. Coding Rules (Aturan Pengkodean)

1. **TypeScript First:** Semua komponen, utility, dan respon API harus memiliki tipe data yang jelas (ditulis dalam `lib/types.ts`). Hindari penggunaan tipe `any` sebisa mungkin.
2. **Komponen Fungsional:** Gunakan React Functional Components dengan React Hooks (`useState`, `useEffect`).
3. **Server vs Client Components:** 
   - Gunakan `'use client'` secara eksplisit di awal file jika komponen memerlukan interaktivitas, React hooks, atau DOM events.
   - Biarkan default sebagai Server Component jika hanya merender konten statis untuk performa SEO dan load time yang lebih baik.
4. **Environment Variables:** Jangan pernah mengunggah file `.env.local` ke repository. Seluruh secret keys (Midtrans, Kredensial DB) harus diamankan.
5. **Linting:** Pastikan tidak ada warning atau error ketika menjalankan `npm run lint` sebelum melakukan push.

---

## 4. Design System (Sistem Desain)

Sistem desain menggunakan **Tailwind CSS** dengan konfigurasi khusus pada `tailwind.config.ts`.

### Palet Warna (Color Palette)
Diatur pada konfigurasi Tailwind untuk menjaga konsistensi:
- **Backgrounds:**
  - Primary: `#f8fafc` (Light Slate)
  - Secondary/Card: `#ffffff` (White)
- **Texts:**
  - Primary: `#0f172a` (Dark Slate)
  - Secondary: `#334155`
  - Muted: `#64748b`
- **Brand / Primary Action:**
  - Shades of Orange: `#ffedd5` (100) hingga `#c2410c` (700) dengan base `#f97316` (500).
- **Status Colors:**
  - Success: `#10b981` (Emerald Green)
  - Warning: `#f59e0b` (Amber)
  - Danger: `#ef4444` (Red)
- **Borders:** `#e2e8f0` (Light Border)

### Tipografi (Typography)
- Mengutamakan penggunaan font monospaced (contoh: `JetBrains Mono`, `Courier New`) untuk memberikan kesan "Retro Terminal" / sistem kasir profesional.

### Ikon (Iconography)
- Menggunakan `lucide-react` untuk ikon yang modern, konsisten, dan scalable.

---

## 5. Design Decisions (Keputusan Desain)

1. **Migrasi dari Vite ke Next.js:** 
   - *Alasan:* Menyatukan Frontend dan Backend (Express) ke dalam satu codebase menghilangkan kerumitan CORS dan kebutuhan menjalankan dua terminal/port yang berbeda. Menyederhanakan deployment.
2. **Penggunaan Tailwind CSS vs CSS Variables Murni:** 
   - *Alasan:* Pengembangan UI yang jauh lebih cepat, responsive (mobile-friendly), dan class utility yang membuat source code komponen tidak bergantung pada file CSS terpisah yang besar.
3. **Single Port Development (Port 3000):**
   - *Alasan:* Backend tidak lagi berjalan terpisah di port 3001. Semua rute `/api` di-handle oleh Next.js server secara internal, mencegah isu port collision.
4. **Retro / Professional Terminal Aesthetic:**
   - *Alasan:* Mempertahankan identitas aplikasi kasir yang praktis, cepat (dengan banyak dukungan keyboard/shortcut yang akan datang), dan meminimalisir distraksi visual (clean and professional slate design).
5. **Integrasi Midtrans:**
   - *Alasan:* Selain menggunakan tunai, skalabilitas proyek disiapkan untuk menerima pembayaran multi-channel dengan gateway yang reliable di Indonesia.
