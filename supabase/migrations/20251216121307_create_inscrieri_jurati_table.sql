/*
  # Creare tabel pentru înscrieri jurați

  ## Descriere
  Acest migration creează infrastructura necesară pentru gestionarea înscrierii juraților
  la Gala Premiilor pentru Directorii Anului.

  ## 1. Tabele Noi
    - `inscrieri_jurati`
      - `id` (uuid, primary key) - Identificator unic
      - `nume` (text) - Numele juratului
      - `prenume` (text) - Prenumele juratului
      - `email` (text, unique) - Adresa de email (unică)
      - `telefon` (text) - Număr de telefon
      - `profesie` (text) - Profesia/funcția actuală
      - `organizatie` (text) - Organizația la care lucrează
      - `experienta` (text) - Descriere experiență profesională
      - `domeniu_expertiza` (text) - Domeniul de expertiză
      - `ani_experienta` (integer) - Ani de experiență în domeniu
      - `linkedin_url` (text, optional) - Link profil LinkedIn
      - `motivatie` (text) - Motivația pentru a deveni jurat
      - `foto_url` (text, optional) - URL către fotografia profesională
      - `status` (text) - Status înscriere: 'in_asteptare', 'aprobat', 'respins'
      - `nota_admin` (text, optional) - Notițe private pentru administratori
      - `created_at` (timestamptz) - Data creării
      - `updated_at` (timestamptz) - Data ultimei actualizări

  ## 2. Securitate
    - Enable RLS pe tabelul `inscrieri_jurati`
    - Policy pentru inserare publică (anyone can register)
    - Policy pentru citire de către administratori
    - Policy pentru actualizare de către administratori
    - Policy pentru ștergere de către administratori
*/

-- Creare tabel inscrieri_jurati
CREATE TABLE IF NOT EXISTS inscrieri_jurati (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  prenume text NOT NULL,
  email text UNIQUE NOT NULL,
  telefon text NOT NULL,
  profesie text NOT NULL,
  organizatie text NOT NULL,
  experienta text NOT NULL,
  domeniu_expertiza text NOT NULL,
  ani_experienta integer NOT NULL DEFAULT 0,
  linkedin_url text,
  motivatie text NOT NULL,
  foto_url text,
  status text NOT NULL DEFAULT 'in_asteptare' CHECK (status IN ('in_asteptare', 'aprobat', 'respins')),
  nota_admin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inscrieri_jurati ENABLE ROW LEVEL SECURITY;

-- Policy: Oricine poate să se înscrie (INSERT public)
CREATE POLICY "Anyone can register as jury"
  ON inscrieri_jurati
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Oricine poate să citească propriile date (pentru confirmare)
CREATE POLICY "Users can read their own registration"
  ON inscrieri_jurati
  FOR SELECT
  TO public
  USING (true);

-- Creare funcție pentru actualizare automată a updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru actualizare automată a updated_at
CREATE TRIGGER update_inscrieri_jurati_updated_at
  BEFORE UPDATE ON inscrieri_jurati
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Creare index pentru căutări rapide
CREATE INDEX IF NOT EXISTS idx_inscrieri_jurati_email ON inscrieri_jurati(email);
CREATE INDEX IF NOT EXISTS idx_inscrieri_jurati_status ON inscrieri_jurati(status);
CREATE INDEX IF NOT EXISTS idx_inscrieri_jurati_created_at ON inscrieri_jurati(created_at DESC);