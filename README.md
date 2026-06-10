# PPOB Kasir - PT. POS Indonesia

Sistem Pembayaran Online Tagihan Listrik PLN berbasis web, dibangun dengan Next.js, MySQL, dan integrasi pembayaran Midtrans.

---

## Latar Belakang Tugas

Proyek ini dikembangkan berdasarkan referensi format struk/resi pembayaran tagihan listrik PLN resmi PT. POS Indonesia (PERSERO):

```
MITRA-01 9860265
Authorized PT.POS INDONESIA (PERSERO)

Tanggal : 29-03-2012  06:52:46
No. Resi : 9860265-01/2012/000001   Petugas : 686026501

        STRUK PEMBAYARAN TAGIHAN LISTRIK

IDPEL      : 537514642525     BL/TH       : MAR12
NAMA       : UMAR BAKRI       STAND METER : 01136700 - 01150400
TARIF/DAYA : R1/1.300 VA      NON SUBSIDI : Rp.           0
RP TAG PLN : Rp.    116.477
NURAMA REF : 00000000131313464565789

  PLN menyatakan struk ini sebagai bukti pembayaran yang sah,
                     mohon disimpan

ADMIN POS   : Rp.      2.500
TOTAL BAYAR : Rp.    118.977

Rincian tagihan dapat diakses di http://www.pln.co.id atau PLN terdekat

                                        [Logo POS INDONESIA]
```

Sistem ini mereplikasi alur kerja kasir POS Indonesia: pencarian pelanggan by IDPEL, konfirmasi tagihan, pembayaran via Midtrans, hingga cetak struk format 80mm.

---

## Fitur

- Login petugas
- Pencarian data pelanggan (IDPEL 12 digit)
- Detail tagihan PLN
- Pembayaran via Midtrans Snap
- Cetak struk format 80mm sesuai standar POS Indonesia
- Kelola data pelanggan (CRUD)
- Riwayat transaksi dengan filter status, tanggal, pencarian
- Status: Belum Bayar / Lunas
- Modal detail transaksi

---

## Teknologi

- Next.js 14, TypeScript, Tailwind CSS
- MySQL
- Midtrans Snap
- JetBrains Mono

---

## Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Setup database

```bash
mysql -u root ppob_kasir < backend/scripts/schema.sql
```

### 3. Environment

Isi `.env.local`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ppob_kasir
DB_PORT=3306
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

**Login:** ID Petugas `686026501` / Password `1234`

---

## Struktur Project

```
app/api/          - API Routes (pelanggan, transaksi, midtrans, tagihan)
components/       - UI Components
lib/              - db, types, utils
public/           - static assets (pos-logo.png)
```
