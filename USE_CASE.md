# Use Case Diagram - Aplikasi PPOB Kasir PT. POS Indonesia

## Deskripsi Sistem
Aplikasi Pembayaran Online Listrik (PPOB) untuk loket PT. POS Indonesia yang memfasilitasi pembayaran tagihan listrik PLN dengan fitur manajemen data pelanggan dan riwayat transaksi.

---

## Aktor

### 1. Petugas Loket
Pegawai PT. POS Indonesia yang bertugas melayani pembayaran tagihan listrik di loket.

**Karakteristik:**
- Memiliki ID Petugas unik
- Ditugaskan di loket tertentu
- Bertanggung jawab atas transaksi pembayaran

---

## Use Case Utama

### 1. Login ke Sistem
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas melakukan autentikasi untuk mengakses sistem  
**Precondition:** Petugas memiliki ID Petugas yang valid  
**Postcondition:** Petugas berhasil login dan masuk ke halaman pencarian  

**Flow Normal:**
1. Sistem menampilkan halaman login
2. Petugas memasukkan ID Petugas
3. Sistem memvalidasi ID Petugas
4. Sistem menampilkan halaman pencarian pelanggan

**Alternate Flow:**
- 3a. ID Petugas tidak valid
  - Sistem menampilkan pesan error
  - Kembali ke step 2

---

### 2. Mencari Data Pelanggan
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas mencari data pelanggan berdasarkan nomor IDPEL  
**Precondition:** Petugas sudah login  
**Postcondition:** Data pelanggan ditemukan dan ditampilkan  

**Flow Normal:**
1. Petugas memasukkan nomor IDPEL (12 digit)
2. Petugas menekan tombol CARI atau tekan ENTER
3. Sistem mencari data pelanggan di database
4. Sistem mengecek status pembayaran tagihan
5. Sistem menampilkan detail tagihan pelanggan

**Alternate Flow:**
- 1a. IDPEL tidak tepat 12 digit
  - Sistem menampilkan pesan error
  - Kembali ke step 1
- 3a. Data pelanggan tidak ditemukan
  - Sistem menampilkan pesan "Data tidak ditemukan"
  - Kembali ke step 1
- 4a. Tagihan sudah lunas
  - Sistem menampilkan pesan "Tagihan sudah LUNAS"
  - Sistem mencegah pembayaran ulang
  - Kembali ke step 1

---

### 3. Melihat Detail Tagihan
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas melihat rincian tagihan pelanggan sebelum melakukan pembayaran  
**Precondition:** Data pelanggan berhasil ditemukan  
**Postcondition:** Detail tagihan ditampilkan lengkap  

**Flow Normal:**
1. Sistem menampilkan informasi master pelanggan:
   - Nama Pelanggan
   - Tarif/Daya
   - No. IDPEL
   - Bulan/Tahun (Periode)
   - Stand Meter
2. Sistem menampilkan rincian tagihan:
   - Rupiah Tagihan PLN
   - Biaya Administrasi POS (Rp 2.500)
   - Total Tagihan
3. Petugas mengkonfirmasi data kepada pembayar
4. Petugas memilih "LANJUT KE PEMBAYARAN" atau "BATALKAN"

**Alternate Flow:**
- 4a. Petugas membatalkan
  - Sistem kembali ke halaman pencarian

---

### 4. Melakukan Pembayaran
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas memproses pembayaran tagihan listrik  
**Precondition:** Detail tagihan sudah dikonfirmasi  
**Postcondition:** Pembayaran berhasil dan struk tercetak  

**Flow Normal:**
1. Sistem menampilkan panel kalkulasi pembayaran
2. Sistem menampilkan ringkasan pelanggan dan total tagihan
3. Petugas memasukkan jumlah tunai yang diterima
4. Sistem menghitung kembalian secara otomatis
5. Sistem memvalidasi jumlah tunai >= total tagihan
6. Petugas menekan F5 atau tombol "EKSEKUSI BAYAR"
7. Sistem membuat nomor resi unik
8. Sistem menyimpan transaksi ke database
9. Sistem menandai tagihan sebagai LUNAS
10. Sistem menampilkan struk pembayaran
11. Petugas mencetak struk untuk pelanggan

**Alternate Flow:**
- 5a. Jumlah tunai kurang dari total tagihan
  - Sistem menampilkan pesan "KURANG: Rp xxx"
  - Tombol bayar disabled
  - Kembali ke step 3
- 6a. Petugas membatalkan (ESC)
  - Sistem kembali ke halaman pencarian

**Business Rules:**
- Biaya admin POS tetap: Rp 2.500
- Nomor resi format: 9860265-01/YYYY/XXXXXX
- Transaksi tersimpan permanen di localStorage

---

### 5. Mencetak Struk Pembayaran
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas mencetak struk sebagai bukti pembayaran  
**Precondition:** Pembayaran berhasil diproses  
**Postcondition:** Struk tercetak  

**Flow Normal:**
1. Sistem menampilkan preview struk pembayaran dengan informasi:
   - Nomor struk (7 digit)
   - Info MITRA dan PT. POS Indonesia
   - Tanggal, No. Resi, Petugas
   - Data pelanggan (IDPEL, Nama, Tarif/Daya, Periode, Stand Meter)
   - Rincian tagihan (RP TAG PLN, NURAMA REF)
   - Total bayar dan admin POS
   - Logo POS Indonesia
2. Petugas menekan tombol "CETAK STRUK"
3. Sistem membuka dialog print browser
4. Petugas mencetak struk (ukuran 80mm thermal)
5. Petugas menyerahkan struk kepada pelanggan

**Alternate Flow:**
- 2a. Petugas memilih "TRANSAKSI BARU"
  - Sistem kembali ke halaman pencarian

---

### 6. Mengelola Data Pelanggan (CRUD)
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas mengelola master data pelanggan listrik  
**Precondition:** Petugas sudah login  
**Postcondition:** Data pelanggan berhasil dikelola  

**Sub Use Case:**

#### 6.1. Melihat Daftar Pelanggan
**Flow Normal:**
1. Petugas membuka menu "KELOLA DATA"
2. Sistem menampilkan tab "DATA PELANGGAN"
3. Sistem menampilkan tabel daftar pelanggan dengan kolom:
   - No, IDPEL, Nama Pelanggan, Tarif/Daya, Periode, Tagihan PLN, Status, Aksi
4. Sistem menampilkan status pembayaran (LUNAS/BELUM BAYAR)
5. Petugas dapat mencari pelanggan dengan search box

#### 6.2. Menambah Data Pelanggan Baru
**Flow Normal:**
1. Petugas menekan tombol "TAMBAH KONSUMEN"
2. Sistem menampilkan form input dengan field:
   - NO. IDPEL (12 Digit) *required
   - NAMA PELANGGAN *required
   - TARIF / DAYA (dropdown)
   - PERIODE (BL/TH) dengan date picker *required
   - LABEL PERIODE (auto-fill)
   - STAND METER *required
   - RUPIAH TAGIHAN PLN *required
   - NON SUBSIDI
3. Petugas mengisi semua field yang required
4. Sistem memvalidasi input:
   - IDPEL harus 12 digit angka
   - IDPEL belum terdaftar
   - Semua field required terisi
5. Petugas menekan "SIMPAN DATA"
6. Sistem menyimpan data ke database
7. Sistem menampilkan pesan sukses
8. Sistem kembali ke daftar pelanggan

**Alternate Flow:**
- 4a. Validasi gagal
  - Sistem menampilkan pesan error di field yang bermasalah
  - Kembali ke step 3
- 5a. Petugas membatalkan
  - Sistem kembali ke daftar pelanggan tanpa menyimpan

#### 6.3. Mengubah Data Pelanggan
**Flow Normal:**
1. Petugas menekan tombol "EDIT" pada row pelanggan
2. Sistem menampilkan form edit dengan data existing
3. Sistem mengkonversi periode ke format date picker
4. Petugas mengubah data yang diperlukan
5. Sistem memvalidasi input
6. Petugas menekan "SIMPAN DATA"
7. Sistem mengupdate data di database
8. Sistem menampilkan pesan sukses
9. Sistem kembali ke daftar pelanggan

**Business Rules:**
- IDPEL tidak dapat diubah saat edit
- Periode otomatis dikonversi dari format MAR12 ke YYYY-MM untuk date picker
- Saat save, periode dikonversi kembali ke format MAR12

#### 6.4. Melihat Detail Pelanggan
**Flow Normal:**
1. Petugas menekan tombol "LIHAT" pada row pelanggan
2. Sistem menampilkan detail lengkap pelanggan
3. Sistem menampilkan total tagihan (Tagihan PLN + Admin POS)
4. Petugas dapat memilih "EDIT", "HAPUS", atau "KEMBALI"

#### 6.5. Menghapus Data Pelanggan
**Flow Normal:**
1. Petugas menekan tombol "HAPUS" pada row pelanggan atau di detail
2. Sistem menampilkan konfirmasi hapus dengan IDPEL
3. Petugas mengkonfirmasi penghapusan
4. Sistem menghapus data dari database
5. Sistem menampilkan pesan sukses
6. Sistem kembali ke daftar pelanggan

**Alternate Flow:**
- 3a. Petugas membatalkan
  - Sistem kembali tanpa menghapus data

**Business Rules:**
- Data yang dihapus tidak dapat dikembalikan
- Riwayat transaksi pelanggan tetap tersimpan meskipun data pelanggan dihapus

---

### 7. Melihat Riwayat Transaksi
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas melihat daftar transaksi pembayaran yang telah dilakukan  
**Precondition:** Petugas sudah login  
**Postcondition:** Riwayat transaksi ditampilkan  

**Flow Normal:**
1. Petugas membuka menu "KELOLA DATA"
2. Petugas memilih tab "RIWAYAT TRANSAKSI"
3. Sistem menampilkan tabel transaksi dengan kolom:
   - No, No. Resi, Tanggal Bayar, Petugas, ID Tagihan, Ref Nurama, Admin, Total Bayar, Aksi
4. Sistem mengurutkan transaksi dari terbaru ke terlama
5. Sistem menampilkan total jumlah transaksi

**Alternate Flow:**
- 3a. Belum ada transaksi
  - Sistem menampilkan pesan "Belum ada transaksi pembayaran"

---

### 8. Mencetak Ulang Struk dari Riwayat
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas mencetak ulang struk pembayaran dari riwayat transaksi  
**Precondition:** Transaksi sudah tersimpan di riwayat  
**Postcondition:** Struk tercetak ulang  

**Flow Normal:**
1. Petugas membuka riwayat transaksi
2. Petugas menekan tombol "CETAK" pada row transaksi
3. Sistem membuka window baru dengan struk pembayaran
4. Sistem mengisi data struk dari transaksi dan data pelanggan
5. Sistem otomatis membuka dialog print
6. Petugas mencetak struk

**Business Rules:**
- Struk cetak ulang memiliki format yang sama dengan struk asli
- Data pelanggan diambil dari database saat ini (bisa berbeda jika sudah diupdate)

---

### 9. Logout dari Sistem
**Aktor:** Petugas Loket  
**Deskripsi:** Petugas keluar dari sistem  
**Precondition:** Petugas sudah login  
**Postcondition:** Petugas logout dan kembali ke halaman login  

**Flow Normal:**
1. Petugas menekan tombol "LOGOUT"
2. Sistem menghapus session petugas
3. Sistem kembali ke halaman login

---

## Use Case Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PPOB Kasir - PT. POS Indonesia               │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────────┐
        │   Petugas    │
        │    Loket     │
        └──────┬───────┘
               │
               │ performs
               │
    ┌──────────┼──────────────────────────────────────┐
    │          │                                       │
    ▼          ▼                                       ▼
┌────────┐ ┌────────────────┐                  ┌──────────────┐
│ Login  │ │ Mencari Data   │                  │   Logout     │
│        │ │   Pelanggan    │                  │              │
└────────┘ └────────┬───────┘                  └──────────────┘
                    │
                    │ <<include>>
                    ▼
           ┌─────────────────┐
           │ Melihat Detail  │
           │    Tagihan      │
           └────────┬────────┘
                    │
                    │ <<extend>>
                    ▼
           ┌─────────────────┐
           │   Melakukan     │
           │   Pembayaran    │
           └────────┬────────┘
                    │
                    │ <<include>>
                    ▼
           ┌─────────────────┐
           │  Mencetak Struk │
           │   Pembayaran    │
           └─────────────────┘

    ┌───────────────────────────────────────────┐
    │      Mengelola Data Pelanggan (CRUD)      │
    ├───────────────────────────────────────────┤
    │  • Melihat Daftar Pelanggan               │
    │  • Menambah Data Pelanggan Baru           │
    │  • Mengubah Data Pelanggan                │
    │  • Melihat Detail Pelanggan               │
    │  • Menghapus Data Pelanggan               │
    └───────────────────────────────────────────┘
                    │
                    │ manages
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Melihat Riwayat │    │  Mencetak Ulang │
│   Transaksi     │    │  Struk dari     │
│                 │    │    Riwayat      │
└─────────────────┘    └─────────────────┘
```

---

## Business Rules

### Pembayaran
1. Setiap transaksi harus memiliki nomor resi unik
2. Biaya administrasi POS tetap Rp 2.500
3. Pelanggan yang sudah membayar tidak dapat melakukan pembayaran ulang untuk periode yang sama
4. Jumlah tunai harus >= total tagihan
5. Struk pembayaran harus dicetak dan diserahkan kepada pelanggan

### Data Pelanggan
1. IDPEL harus unik (12 digit angka)
2. Periode tagihan menggunakan format BL/TH (contoh: MAR12)
3. Data pelanggan dapat diubah kecuali IDPEL
4. Penghapusan data pelanggan tidak menghapus riwayat transaksi

### Transaksi
1. Semua transaksi tersimpan permanen di localStorage
2. Transaksi tidak dapat dihapus atau diubah
3. Struk dapat dicetak ulang kapan saja dari riwayat
4. Setiap transaksi mencatat ID petugas yang melakukan

### Sistem
1. Petugas harus login sebelum mengakses sistem
2. Data tersimpan di localStorage browser
3. Sistem menggunakan format tanggal Indonesia (dd/mm/yyyy)
4. Struk menggunakan format thermal printer 80mm

---

## Non-Functional Requirements

### Performance
- Pencarian data pelanggan < 1 detik
- Proses pembayaran < 2 detik
- Print struk < 3 detik

### Usability
- Interface menggunakan tema retro terminal
- Shortcut keyboard untuk aksi cepat (F5, ESC, ENTER)
- Feedback visual untuk setiap aksi
- Validasi real-time pada form input

### Security
- Autentikasi petugas dengan ID Petugas
- Data tersimpan lokal di browser
- Session management untuk login

### Reliability
- Data tersimpan di localStorage (persistent)
- Validasi input untuk mencegah data corrupt
- Error handling untuk semua operasi

---

## Technology Stack
- **Frontend:** React + TypeScript
- **Styling:** CSS Variables (Retro Terminal Theme)
- **Storage:** localStorage (Browser)
- **Build Tool:** Vite
- **Print:** Browser Print API

---

## Future Enhancements
1. Export riwayat transaksi ke Excel/PDF
2. Filter dan pencarian di riwayat transaksi
3. Laporan harian/bulanan
4. Multi-user dengan role management
5. Backup dan restore database
6. Integrasi dengan API PLN real-time
7. Notifikasi untuk tagihan jatuh tempo
8. Dashboard statistik transaksi
