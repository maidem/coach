// Admin Masters
export interface Belt {
  id: number;
  name: string; // z.B. "Weiß", "Gelb", "Orange"
  order: number;
  created_at?: string;
}

export interface WeightClass {
  id: number;
  name: string; // z.B. "-50kg", "50-60kg"
  min_weight?: number;
  max_weight?: number;
  created_at?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface Competition {
  id: number;
  name: string;
  tournament_link: string | null;
  date?: string; // ISO date YYYY-MM-DD
  ausschreibung?: string | null; // base64 PDF data URI
  created_at?: string;
}

export interface TravelOption {
  id: number;
  name: string; // z.B. "Selbst fahren", "Mitfahrgelegenheit"
  created_at?: string;
}

export interface Equipment {
  id: number;
  name: string; // z.B. "Judogi", "Tasche"
  created_at?: string;
}

// Main Entity
export interface Athlete {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo?: string | null;
  belt_id: number | null;
  weight_class_id: number | null;
  group_id: number | null;
  competition_id: number | null;
  travel_option_id: number | null;
  equipment_ids?: number[]; // Many-to-many
  entry_fee_paid: boolean; // Startgebühr bezahlt
  overnight_stay: boolean; // Übernachtung
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined data
  belt_name?: string;
  weight_class_name?: string;
  group_name?: string;
  competition_name?: string;
  travel_option_name?: string;
  equipment?: Equipment[];
}
