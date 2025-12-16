import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface JuryRegistration {
  id?: string;
  nume: string;
  prenume: string;
  email: string;
  telefon: string;
  profesie: string;
  organizatie: string;
  experienta: string;
  domeniu_expertiza: string;
  ani_experienta: number;
  linkedin_url?: string;
  motivatie: string;
  foto_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export async function submitJuryRegistration(data: JuryRegistration) {
  const { data: result, error } = await supabase
    .from('inscrieri_jurati')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error submitting registration:', error);
    throw error;
  }

  return result;
}
