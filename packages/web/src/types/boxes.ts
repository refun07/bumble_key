export interface Partner {
  id: number;
  name: string;
  business_name?: string;
}

export interface Hive {
  id: number;
  name: string;
  status: string;
  location_name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  total_cells: number;
  available_cells_count: number;
  partner_id?: number;
  partner?: Partner;
  photos?: string[];
}

export type HivePayload = {
  name: string;
  location_name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  total_cells: number;
  partner_id: string; // keep as string if your select stores string
  image: File | null;
};

export type HiveEditPayload = {
  name: string;
  location_name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  partner_id?: number;
  status?: string;
  image?: File | null;
};
