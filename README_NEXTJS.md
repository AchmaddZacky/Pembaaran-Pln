# PPOB Kasir - Next.js Version

## 🚀 Migrasi ke Next.js 15

Project ini telah berhasil dimigrasi dari Vite + React ke **Next.js 15** dengan full-stack architecture.

### ✨ Fitur Baru

- ✅ **Full-stack Next.js** - Frontend & Backend dalam satu project
- ✅ **Design Modern** - Palet warna profesional, tidak AI slop
- ✅ **Responsive Layout** - Mobile-friendly dengan Tailwind CSS
- ✅ **API Routes** - Backend terintegrasi tanpa server terpisah
- ✅ **TypeScript** - Type-safe development
- ✅ **MySQL Database** - Sama seperti sebelumnya

### 🎨 Design System

**Palet Warna:**
- Primary: Sky Blue (#0ea5e9)
- Success: Emerald Green (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)
- Background: Slate Dark (#0f172a, #1e293b)

### 📦 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Setup database:**
   - Gunakan script SQL yang sama: `backend/scripts/schema.sql`
   - Update `.env.local` dengan kredensial database Anda

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

### 📁 Struktur Project

```
ppob-kasir/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── health/
│   │   ├── pelanggan/
│   │   ├── petugas/
│   │   └── transaksi/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── Header.tsx
│   ├── StatusBar.tsx
│   ├── LoginForm.tsx
│   └── SearchForm.tsx
├── lib/                  # Utilities
│   ├── db.ts            # Database connection
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
└── .env.local           # Environment variables
```

### 🔄 Perbedaan dengan Versi Lama

| Aspek | Lama (Vite) | Baru (Next.js) |
|-------|-------------|----------------|
| Frontend | React + Vite | Next.js 15 |
| Backend | Express (terpisah) | Next.js API Routes |
| Styling | CSS Variables | Tailwind CSS |
| Routing | Client-side | App Router |
| Server | Port 3001 terpisah | Single port 3000 |

### 🛠️ Development

- `npm run dev` - Development mode
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - ESLint check

### 📝 Todo

- [ ] Billing Detail component
- [ ] Payment Panel component  
- [ ] Admin Page (CRUD)
- [ ] Print receipt feature
- [ ] Transaction history

### 🔐 Login Demo

- ID Petugas: `686026501`
- Password: `1234`

---

**Powered by Next.js 15 + MySQL**
