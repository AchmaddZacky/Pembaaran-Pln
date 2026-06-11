# Dokumentasi Sistem PPOB Kasir - PT. POS Indonesia

Sistem pembayaran tagihan listrik PLN berbasis web yang dioperasikan oleh petugas kasir POS Indonesia.

---

## Alur Sistem

```
Login → Pencarian Pelanggan → Detail Tagihan → Pembayaran → Struk
                                                    ↓
                                            Kelola Data (Admin)
```

---

## 1. Login

**Halaman:** `/` (LoginForm)

Petugas masukkan ID Petugas dan password untuk mengakses sistem.

- ID Petugas divalidasi ke database tabel `petugas`
- Password saat ini menggunakan password statis `1234`
- Setelah login berhasil, data petugas disimpan ke `localStorage`
- Sesi otomatis dipulihkan saat halaman di-refresh

**Data yang disimpan:**
```
localStorage: petugas, currentPage
```

---

## 2. Pencarian Pelanggan

**Halaman:** SearchForm

Petugas mencari data pelanggan berdasarkan IDPEL (12 digit).

**Fitur:**
- Input IDPEL manual (hanya angka, max 12 digit)
- Daftar semua pelanggan terdaftar ditampilkan
- Status **Lunas** / **Belum Bayar** ditampilkan per pelanggan
- Pelanggan yang sudah lunas tidak bisa diklik
- Klik nama pelanggan → IDPEL otomatis terisi

**Validasi:**
- IDPEL harus tepat 12 digit
- Jika tagihan sudah lunas → tampil error "Tagihan sudah LUNAS"

**API yang digunakan:**
- `GET /api/pelanggan` — ambil semua data pelanggan
- `GET /api/transaksi/check-paid/[id_tagihan]` — cek status bayar per tagihan

---

## 3. Detail Tagihan

**Halaman:** BillingDetail

Setelah pelanggan ditemukan, sistem menampilkan detail tagihan.

**Informasi yang ditampilkan:**
- IDPEL dan nama pelanggan
- Periode tagihan (BL/TH)
- Stand meter
- Tarif/Daya
- Rincian tagihan PLN + Non Subsidi + Admin POS
- Total yang harus dibayar

**Aksi:**
- Tombol **Lanjut ke Pembayaran** → ke halaman PaymentPanel
- Tombol **Batal** → kembali ke pencarian

---

## 4. Pembayaran

**Halaman:** PaymentPanel

Petugas mengkonfirmasi pembayaran dan memproses via Midtrans Snap.

**Alur pembayaran:**
1. Klik **Bayar dengan Midtrans**
2. Sistem generate `no_resi` (format: `POS` + timestamp + random) dan `nurama_ref` (16 digit random)
3. Request ke `POST /api/midtrans/create-transaction` → dapat Snap token
4. Popup Midtrans terbuka
5. Pelanggan/petugas pilih metode pembayaran dan selesaikan
6. Callback `onSuccess` → `saveTransaction()` dipanggil

**Penyimpanan transaksi (`saveTransaction`):**
- `POST /api/transaksi` — insert ke tabel `transaksi` dengan `payment_status = 'paid'`
- `PATCH /api/tagihan/[id]/status` — update `status_bayar = 'SUDAH_BAYAR'` di tabel `tagihan`

**Redirect dari Midtrans:**
- Midtrans redirect ke `localhost:3000/?order_id=...&transaction_status=finish`
- App baca URL params, fetch `nurama_ref` dari DB via `GET /api/transaksi/[no_resi]`
- Tampilkan halaman sukses dengan data lengkap

**Halaman Sukses:**
- No. Resi, Nurama Ref, Tanggal, Petugas
- IDPEL, Nama, Periode
- Rincian tagihan dan total
- Tombol **Cetak Struk** dan **Transaksi Baru**

---

## 5. Cetak Struk

Format struk 80mm sesuai standar POS Indonesia:

```
MITRA-01 [ID_PETUGAS]
Authorized PT.POS INDONESIA (PERSERO)
─────────────────────────────────
Tanggal : DD/MM/YYYY HH:MM:SS
No.Resi : [NO_RESI]
Petugas : [ID_PETUGAS]
─────────────────────────────────
    STRUK PEMBAYARAN TAGIHAN LISTRIK
─────────────────────────────────
IDPEL      : [IDPEL]
NAMA       : [NAMA_PELANGGAN]
BL/TH      : [PERIODE]
TARIF/DAYA : [TARIF]
STAND METER: [STAND_METER]
RP TAG PLN : Rp. [TAGIHAN]
NON SUBSIDI: Rp. [NON_SUBSIDI]
NURAMA REF : [NURAMA_REF]
─────────────────────────────────
  PLN menyatakan struk ini sebagai
  bukti pembayaran yang sah
─────────────────────────────────
ADMIN POS  : Rp. 2.500
TOTAL BAYAR: Rp. [TOTAL]
─────────────────────────────────
                     [Logo POS]
```

---

## 6. Kelola Data (Admin)

**Halaman:** AdminPage  
**Akses:** Tombol ⚙️ Kelola Data di SearchForm

### Tab: Data Pelanggan

Manajemen CRUD data pelanggan dan tagihan.

**Fitur:**
- Cari pelanggan by IDPEL atau nama
- Tambah pelanggan baru
  - Generate IDPEL random 12 digit (tombol 🎲 Generate, dijamin unik)
  - Input: IDPEL, Nama, Tarif/Daya, Periode, Stand Meter, Tagihan PLN
- Edit data pelanggan
- Hapus pelanggan (dengan konfirmasi)
- Lihat detail pelanggan
- Kolom **Status** menampilkan Lunas / Belum Bayar dari `status_bayar` di tabel `tagihan`

**API:**
- `GET /api/pelanggan` — list semua
- `POST /api/pelanggan` — tambah baru
- `PUT /api/pelanggan/[idpel]` — update
- `DELETE /api/pelanggan/[idpel]` — hapus

### Tab: Riwayat Transaksi

Daftar semua transaksi pembayaran.

**Filter:**
- Cari by No. Resi / Nama / IDPEL
- Filter by status: Semua / Lunas / Pending / Gagal
- Filter by tanggal

**Kolom tabel:**
- No. Resi, Tanggal, Pelanggan (Nama + IDPEL), Periode, Petugas, Total, Status, Aksi

**Aksi per baris:**
- **Detail** — modal detail lengkap (No. Resi, Nurama Ref, Tanggal, Status, IDPEL, Nama, Periode, Petugas, Admin POS, Total)
- **🖨️ Struk** — cetak struk (hanya muncul jika status Lunas)

**API:**
- `GET /api/transaksi` — list semua transaksi dengan JOIN pelanggan, tagihan, petugas

---

## 7. Status Bar

Selalu tampil di bagian bawah halaman.

- Nama petugas yang sedang login
- Status koneksi (Online/Offline) — cek via `GET /api/health`
- Jam real-time

---

## Struktur Database

### Tabel `petugas`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_petugas | varchar(20) PK | ID petugas |
| nama_petugas | varchar(50) | Nama petugas |
| password | varchar(255) | Password (hashed) |

### Tabel `pelanggan`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| idpel | varchar(20) PK | ID pelanggan |
| nama_pelanggan | varchar(100) | Nama |
| tarif_daya | varchar(20) | Tarif listrik |

### Tabel `tagihan`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_tagihan | int PK AUTO | ID tagihan |
| idpel | varchar(20) FK | Relasi pelanggan |
| bl_th | varchar(10) | Periode (contoh: APR26) |
| stand_meter | varchar(30) | Angka meteran |
| rp_tag_pln | decimal(12,2) | Tagihan PLN |
| non_subsidi | decimal(12,2) | Non subsidi |
| status_bayar | enum | BELUM_BAYAR / SUDAH_BAYAR |

### Tabel `transaksi`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| no_resi | varchar(30) PK | Nomor resi (POS+timestamp+random) |
| tanggal_bayar | datetime | Waktu transaksi |
| id_petugas | varchar(20) FK | Petugas yang memproses |
| id_tagihan | int FK | Tagihan yang dibayar |
| nurama_ref | varchar(30) | Nomor referensi random 16 digit |
| admin_pos | decimal(10,2) | Biaya admin (Rp 2.500) |
| total_bayar | decimal(12,2) | Total pembayaran |
| payment_status | varchar(20) | paid / pending / failed |
| midtrans_token | varchar(255) | Token Midtrans |
| jumlah_tunai | decimal(12,2) | Jumlah tunai |
| kembalian | decimal(12,2) | Kembalian |

---

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/health` | Cek koneksi database |
| GET | `/api/pelanggan` | List semua pelanggan + tagihan |
| POST | `/api/pelanggan` | Tambah pelanggan baru |
| GET | `/api/pelanggan/[idpel]` | Detail pelanggan |
| PUT | `/api/pelanggan/[idpel]` | Update pelanggan |
| DELETE | `/api/pelanggan/[idpel]` | Hapus pelanggan |
| GET | `/api/petugas/[id]` | Data petugas untuk login |
| GET | `/api/transaksi` | List semua transaksi (dengan JOIN) |
| POST | `/api/transaksi` | Simpan transaksi baru |
| GET | `/api/transaksi/[no_resi]` | Detail transaksi by no resi |
| GET | `/api/transaksi/check-paid/[id_tagihan]` | Cek apakah tagihan sudah lunas |
| PATCH | `/api/tagihan/[id]/status` | Update status_bayar ke SUDAH_BAYAR |
| POST | `/api/midtrans/create-transaction` | Buat transaksi Midtrans |
| POST | `/api/midtrans/notification` | Webhook notifikasi Midtrans |
