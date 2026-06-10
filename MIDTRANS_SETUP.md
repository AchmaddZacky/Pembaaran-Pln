# 💳 Midtrans Payment Gateway Integration

## Setup Midtrans

### 1. Daftar Akun Midtrans
1. Buka https://dashboard.midtrans.com/register
2. Daftar dengan email Anda
3. Verifikasi email
4. Login ke dashboard

### 2. Dapatkan API Keys

**Sandbox (Testing):**
1. Login ke https://dashboard.sandbox.midtrans.com
2. Klik **Settings** → **Access Keys**
3. Copy:
   - **Server Key** (SB-Mid-server-xxx)
   - **Client Key** (SB-Mid-client-xxx)

**Production:**
1. Login ke https://dashboard.midtrans.com
2. Lengkapi verifikasi bisnis
3. Klik **Settings** → **Access Keys**
4. Copy Server Key & Client Key production

### 3. Update Environment Variables

Edit file `.env.local`:

```env
# Midtrans Sandbox (untuk testing)
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_ACTUAL_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_ACTUAL_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false

# Untuk production, ganti dengan:
# MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_KEY
# MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_KEY
# MIDTRANS_IS_PRODUCTION=true
```

### 4. Update Database Schema

Jalankan migration untuk menambah kolom payment status:

```bash
mysql -u root -p ppob_kasir < migrations/add_payment_status.sql
```

Atau manual di MySQL:

```sql
ALTER TABLE transaksi 
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' 
AFTER total_bayar;

ALTER TABLE transaksi 
ADD COLUMN midtrans_token VARCHAR(255) 
AFTER payment_status;
```

### 5. Restart Server

```bash
# Stop current server (Ctrl + C)
npm run dev
```

## Testing Payment

### Sandbox Test Cards

**Credit Card (Success):**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Expired: `01/25` (atau bulan/tahun di masa depan)
- OTP: `112233`

**Other Payment Methods:**
- GoPay: Use dummy number `081234567890`, OTP: `112233`
- Bank Transfer: Will generate VA number
- E-Wallet: Follow popup instructions

### Payment Flow

1. **User** → Klik "Bayar dengan Midtrans"
2. **Popup Midtrans** → Pilih metode pembayaran
3. **Complete Payment** → Masukkan test card / finish payment
4. **Callback** → Sistem otomatis update status
5. **Success Page** → Tampil bukti pembayaran

## Webhook Configuration

### Setup Webhook Notification

1. Login Midtrans Dashboard
2. Go to **Settings** → **Configuration**
3. Set **Notification URL:**
   ```
   https://your-domain.com/api/midtrans/notification
   ```
4. Untuk local development, gunakan ngrok:
   ```bash
   ngrok http 3000
   # Copy URL: https://xxxx.ngrok.io
   # Set notification: https://xxxx.ngrok.io/api/midtrans/notification
   ```

## Production Checklist

- [ ] Ganti ke Production API Keys
- [ ] Update `MIDTRANS_IS_PRODUCTION=true`
- [ ] Setup HTTPS (required by Midtrans)
- [ ] Configure notification URL with actual domain
- [ ] Test all payment methods
- [ ] Enable payment methods yang diinginkan di dashboard
- [ ] Setup fraud detection rules (optional)
- [ ] Monitor transactions via dashboard

## Troubleshooting

**Popup tidak muncul:**
- Check console browser untuk error
- Pastikan Snap.js loaded (check Network tab)
- Verify CLIENT_KEY benar

**Payment gagal:**
- Cek log server (`/api/midtrans/create-transaction`)
- Verify SERVER_KEY benar
- Pastikan amount > 0
- Check Midtrans dashboard untuk detail error

**Webhook tidak jalan:**
- Pastikan notification URL accessible dari internet
- Check log `/api/midtrans/notification`
- Test webhook manually dari Midtrans dashboard

## Support

- Docs: https://docs.midtrans.com
- Dashboard: https://dashboard.midtrans.com
- Support: support@midtrans.com
