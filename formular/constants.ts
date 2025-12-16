export const STEPS = [
  "Contact și Experiență",
  "Unitatea de Învățământ",
  "Statistici Cheie",
  "Alegere Categorii",
  "Descriere Proiecte",
  "Referințe",
  "Finalizare"
];

export const CATEGORII_PROIECT = [
  { id: 'inovare', label: 'Inovare', description: 'Proiecte care aduc o schimbare semnificativă în procesul educațional.' },
  { id: 'egalitate', label: 'Egalitate de Șanse', description: 'Inițiative care promovează incluziunea și sprijină elevii din medii defavorizate.' },
  { id: 'antreprenoriat', label: 'Antreprenoriat', description: 'Proiecte care dezvoltă spiritul antreprenorial în rândul elevilor și al comunității.' },
];

export const TIPURI_RECOMANDARE = ['Subordonat', 'Nesubordonat', 'Fost elev'];

export const MOD_OCUPARE_OPTIONS = [
  "Numire ISJ",
  "Detașare ISJ",
  "Concurs",
  "Altă situație"
];

export const ANI_CONDUCERE_OPTIONS = [
  "până în 2 ani",
  "între 2 și 5 ani",
  "între 5 și 10 ani",
  "mai mult de 10 ani"
];

export const JUDETE = ["Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "Buzău", "Caraș-Severin", "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea", "Vrancea", "București"];

export const REGIUNI = ["București-Ilfov", "Centru", "Nord-Est", "Nord-Vest", "Sud-Est", "Sud-Muntenia", "Sud-Vest Oltenia", "Vest"];

export const NIVELURI_INVATAMANT = [
    { id: "prescolar", label: "Învățământ preșcolar" },
    { id: "primar", label: "Învățământ primar" },
    { id: "gimnazial", label: "Învățământ gimnazial" },
    { id: "licealTeoretic", label: "Învățământ liceal teoretic" },
    { id: "licealTehnologic", label: "Învățământ liceal tehnologic și profesional" },
    { id: "postliceal", label: "Învățământ postliceal" },
    { id: "special", label: "Învățământ special" },
    { id: "integrat", label: "Învățământ integrat" },
];

export const LUNI = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

const currentYear = new Date().getFullYear();
export const ANI = Array.from({ length: 40 }, (_, i) => (currentYear - i).toString());

export const DEADLINE = { year: 2026, day: 20, monthIndex: 3, hour: 23, minute: 59 };
export const DEADLINE_LABEL = `${DEADLINE.day} ${LUNI[DEADLINE.monthIndex].toLowerCase()} ${DEADLINE.year}, ora ${String(DEADLINE.hour).padStart(2, '0')}:${String(DEADLINE.minute).padStart(2, '0')}`;
