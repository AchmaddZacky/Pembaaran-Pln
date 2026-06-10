import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create Core API instance for notification
    const apiClient = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });

    const statusResponse = await apiClient.transaction.notification(body);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification: ${orderId} - ${transactionStatus}`);

    // Handle transaction status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        // Payment success - update database
        await updateTransactionStatus(orderId, 'paid');
      }
    } else if (transactionStatus === 'settlement') {
      // Payment success - update database
      await updateTransactionStatus(orderId, 'paid');
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      // Payment failed - update database
      await updateTransactionStatus(orderId, 'failed');
    } else if (transactionStatus === 'pending') {
      // Payment pending
      await updateTransactionStatus(orderId, 'pending');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

async function updateTransactionStatus(orderId: string, status: string) {
  try {
    await query(
      'UPDATE transaksi SET payment_status = ? WHERE no_resi = ?',
      [status, orderId]
    );

    // Jika paid, update status_bayar di tagihan juga
    if (status === 'paid') {
      await query(
        `UPDATE tagihan t
         JOIN transaksi tr ON t.id_tagihan = tr.id_tagihan
         SET t.status_bayar = 'SUDAH_BAYAR'
         WHERE tr.no_resi = ?`,
        [orderId]
      );
    }
  } catch (err) {
    console.error('Failed to update transaction status', err);
  }
}
