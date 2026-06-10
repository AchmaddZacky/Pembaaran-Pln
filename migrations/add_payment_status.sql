-- Add payment_status column to transaksi table
ALTER TABLE transaksi 
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' 
AFTER total_bayar;

-- Add midtrans_token column for reference
ALTER TABLE transaksi 
ADD COLUMN midtrans_token VARCHAR(255) 
AFTER payment_status;
