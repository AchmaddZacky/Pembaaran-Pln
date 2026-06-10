export interface Petugas {
  id_petugas: string;
  nama_petugas: string;
  loket: string;
}

export interface Pelanggan {
  idpel: string;
  nama_pelanggan: string;
  tarif_daya: string;
}

export interface Tagihan {
  id_tagihan: number;
  idpel: string;
  bl_th: string;
  stand_meter: string;
  rp_tag_pln: number;
  non_subsidi: number;
  status_bayar?: 'BELUM_BAYAR' | 'SUDAH_BAYAR';
}

export interface BillingData {
  pelanggan: Pelanggan;
  tagihan: Tagihan;
}

export interface Transaksi {
  no_resi: string;
  id_petugas: string;
  id_tagihan: number;
  nurama_ref: string;
  admin_pos: number;
  total_bayar: number;
  jumlah_tunai: number;
  kembalian: number;
  tanggal_bayar: string;
  payment_status: 'paid' | 'pending' | 'failed';
  // joined fields
  nama_pelanggan?: string;
  idpel?: string;
  bl_th?: string;
  nama_petugas?: string;
}

export interface PelangganFormData {
  idpel: string;
  nama_pelanggan: string;
  tarif_daya: string;
  bl_th: string;
  stand_meter: string;
  rp_tag_pln: string;
  non_subsidi: string;
}

export type AppPage = 'login' | 'search' | 'billing' | 'payment' | 'admin';
export type CrudMode = 'list' | 'create' | 'edit' | 'detail';
