export interface JuryFormData {
  nume: string;
  prenume: string;
  email: string;
  confirmEmail: string;
  password: string;
  telefon: string;
  profesie: string;
  organizatie: string;
  experienta: string;
  domeniu_expertiza: string;
  ani_experienta: string;
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
  motivatie: string;
  foto_url: string;
  acordGDPR: boolean;
}

export interface JuryFormErrors {
  [key: string]: string | undefined;
  nume?: string;
  prenume?: string;
  email?: string;
  confirmEmail?: string;
  password?: string;
  telefon?: string;
  profesie?: string;
  organizatie?: string;
  experienta?: string;
  domeniu_expertiza?: string;
  ani_experienta?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  motivatie?: string;
  foto_url?: string;
  acordGDPR?: string;
}

export interface ThemeColors {
  bgStart: string;
  bgEnd: string;
  inputBg: string;
  textDark: string;
  textLight: string;
  button: string;
  white: string;
}
