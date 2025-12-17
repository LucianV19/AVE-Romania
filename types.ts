// types.ts

import { FormData as DirectorFormData } from './formular/types';

export enum View {
  HOME = 'Acasă',
  JUDGE = 'Portal Jurat',
  JURAT_ACCESS = 'Acces Jurat',
  ADMIN = 'Administrare',
  ADMIN_ACCESS = 'Acces Administrator',
  LEADERBOARD = 'Clasament',
  DOCUMENTATION = 'Documentație',
  FORMULAR = 'Formular Înscriere',
  JURAT_FORM = 'Înscriere Jurat',
}

export enum UserRole {
  JUDGE = 'Jurat',
  ADMIN = 'Admin',
  VIEWER = 'Vizualizator',
}

export enum Status {
  NEINCEPUT = 'Neînceput',
  IN_CURS = 'În curs',
  FINALIZAT = 'Finalizat',
}

export enum Regiune {
  NORD_EST = 'Nord-Est',
  SUD_EST = 'Sud-Est',
  SUD_MUNTENIA = 'Sud-Muntenia',
  SUD_VEST_OLTENIA = 'Sud-Vest Oltenia',
  VEST = 'Vest',
  NORD_VEST = 'Nord-Vest',
  CENTRU = 'Centru',
  BUCURESTI_ILFOV = 'București-Ilfov',
}

export interface User {
  id: string;
  nume: string;
  rol: UserRole;
}

export interface Jurat extends User {
  rol: UserRole.JUDGE;
  email?: string;
  telefon?: string;
  profesie?: string;
  organizatie?: string;
  experienta?: string;
  domeniu_expertiza?: string;
  ani_experienta?: number;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  motivatie?: string;
  foto_url?: string;
  password?: string;
  stages?: string[]; // IDs of stages the judge is active in
}

export interface Admin extends User {
  rol: UserRole.ADMIN;
}

export interface Stage {
  id: string;
  nume: string;
  activ: boolean;
  isCurrent?: boolean; // New property to mark the currently running stage
}

export interface Category {
  id: string;
  nume: string;
}

export interface Criterion {
  id: string;
  etapaId: string;
  categorieId: string;
  nume: string;
  descriere: string;
  scorMin: number;
  scorMax: number;
}

export interface Candidat {
  id: string;
  nume: string;
  titlu: string;
  scoala: string;
  regiune: Regiune;
  categorieIds: string[];
  // Optional submission coming from external platform. Can be a URL to a file/page or raw HTML/text.
  submissionUrl?: string;
  submissionHtml?: string;
  submissionText?: string;
  promotions?: { [fromStageId: string]: boolean };
  isWinner?: boolean;
  winningCategoryId?: string;
  extendedData?: DirectorFormData;
}

export interface Assignment {
  id: string;
  candidatId: string;
  juratId: string;
  etapaId: string;
  categorieId: string;
  status: Status;
  scoruri: Record<string, number>; // criterionId: score
  scorFinal?: number;
  observatii: Record<string, string>; // criterionId: observation text
  lastModified: Date;
}

export interface AuditLogDetails {
  candidatId?: string;
  numeCandidat?: string;
  juratId?: string;
  numeJurat?: string;
  etapaId?: string;
  criteriuId?: string;
  statusVechi?: Status;
  statusNou?: Status;
  scorVechi?: number;
  scorNou?: number;
  modificare?: string;
  valoareVeche?: string | number | boolean;
  valoareNoua?: string | number | boolean;
  motiv: string;
  numarModificari?: number;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  adminId: string;
  actiune: string;
  detalii: AuditLogDetails;
}

export type DocumentationContent = Record<string, string>;