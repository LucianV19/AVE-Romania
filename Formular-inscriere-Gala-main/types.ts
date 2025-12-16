export interface Recomandare {
  id: string;
  nume: string;
  functie: string;
  telefon: string;
  tip: 'Subordonat' | 'Nesubordonat' | 'Fost elev' | '';
}

export interface OrganizatieReferinta {
  id: string;
  nume: string;
  telefon: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  content: string; // Data URL (base64)
  progress?: number; // 0-100
}

export interface Statistici {
  eleviInscrisi: string;
  eleviRomi: string;
  eleviCES: string;
  eleviDezavantajati: string;
  eleviBursaSociala: string;
  eleviNavetisti: string;
  eleviAbandonScolar: string;
  personalDidacticTitular: string;
  personalDidacticSuplinitor: string;
  personalNedidactic: string;
}

export interface ProiectNarativ {
    modelInterventie: string;
    schimbariProduse: string;
    strategieComunicare: string;
    riscuriGestionate: string;
    indicatoriMasurati: string;
    continuitate: string;
    invataturi: string;
    relatieAutoritati: string;
    documenteJustificative: UploadedFile[];
}

export interface FormData {
  // Pasul 1: Date de Contact
  email: string;
  confirmEmail: string;
  nume: string;
  prenume: string;
  telefon: string;

  // Pasul 2: Experiență Profesională
  functieInceputAn: string;
  functieInceputLuna: string;
  aniActivitateSistem: string;
  modOcupareFunctie: string;
  modOcupareDetalii?: string;
  aniConducereAcumulati: string;

  // Pasul 3: Unitatea de Învățământ
  judetUnitate: string;
  localitateUnitate: string;
  denumireUnitate: string;
  adresaUnitate: string;
  websiteUnitate: string;
  regiuneUnitate: string;
  niveluriInvatamant: { [key: string]: boolean };
  arePersonalitateJuridica: 'da' | 'nu' | '';
  unitateParinte?: string;

  // Pasul 4: Statistici
  statistici: Statistici;

  // Pasul 5: Alegere Categorii
  categorii: { [key: string]: boolean };

  // Pasul 6: Proiecte Narative
  proiecteNarative: {
    inovare?: ProiectNarativ;
    egalitate?: ProiectNarativ;
    antreprenoriat?: ProiectNarativ;
  };

  // Pasul 7: Prezență Online
  linkedinProfile: string;
  facebookProfile: string;
  otherProfile: string;
  
  // Pasul 8: Recomandări
  recomandari: Recomandare[];
  organizatiiReferinta?: OrganizatieReferinta[];

  // Pasul 9: Acorduri
  acordGDPR: boolean;
  acordRegulament: boolean;
}

export type FormErrors = {
  [K in keyof Omit<FormData, 'statistici'>]?: string;
} & {
  niveluriInvatamant?: string;
  categorii?: string;
  statistici?: { [K in keyof Statistici]?: string };
};

export interface ThemeColors {
  bgStart: string;
  bgEnd: string;
  inputBg: string;
  textDark: string;
  textLight: string;
  button: string;
  white: string;
}
