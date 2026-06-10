export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateResi(): string {
  const prefix = 'POS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateRefNumara(): string {
  return Math.random().toString().slice(2, 18);
}

export const TARIF_OPTIONS = [
  'R1 / 450 VA',
  'R1 / 900 VA',
  'R1 / 1.300 VA',
  'R1 / 2.200 VA',
  'R2 / 2.200 VA',
  'R2 / 3.500 VA',
  'R3 / 6.600 VA',
  'B1 / 6.600 VA',
  'B2 / 10.600 VA',
];

export const ADMIN_FEE = 2500;
