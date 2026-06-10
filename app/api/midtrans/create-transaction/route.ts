import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, customerDetails, itemDetails } = body;

    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${appUrl}/?order_id=${orderId}&transaction_status=finish`,
        error: `${appUrl}/?order_id=${orderId}&transaction_status=error`,
        pending: `${appUrl}/?order_id=${orderId}&transaction_status=pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
