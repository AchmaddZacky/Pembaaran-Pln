import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return NextResponse.json({ status: 'OK', message: 'Database connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'ERROR', message: 'Database connection failed' },
      { status: 500 }
    );
  }
}
