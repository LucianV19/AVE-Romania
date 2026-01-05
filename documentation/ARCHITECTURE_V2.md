# 🏗️ Arhitectură Tehnică & Design V2

Acest document detaliază îmbunătățirile de arhitectură, modelul de date și integrările pentru platforma AVE România (Gala Directorilor Anului), conform cerințelor din Etapa 2.

---

## 1. 📊 Model de Date (Schema Propusă)

Deși aplicația rulează momentan pe `localStorage`, structura datelor trebuie să reflecte o bază de date relațională (ex: PostgreSQL/Supabase) pentru scalabilitate.

### Entități Principale

#### `User` (Extensibil pentru Admin/Jurat)
- `id`: UUID
- `email`: string (unique)
- `role`: 'admin' | 'judge' | 'viewer'
- `metadata`: JSON (pentru preferințe UI)

#### `Candidat` (Director)
- `id`: UUID
- `nume`: string
- `prenume`: string
- `email`: string
- `telefon`: string
- `scoala`: string
- `judet`: string
- `regiune`: ENUM ('Nord-Est', 'București-Ilfov', etc.)
- `categorieIds`: string[] (Array de ID-uri categorii)
- `submissionData`: JSON (Datele brute din formular)
- `submissionUrl`: string (Link extern opțional)
- `status`: 'pending' | 'approved' | 'rejected'

#### `Jurat`
- `id`: UUID (FK -> User)
- `nume`: string
- `specializare`: string
- `regiuniExcluse`: string[] (Pentru conflict de interese)

#### `Assignment` (Asignare)
- `id`: UUID
- `candidatId`: UUID
- `juratId`: UUID
- `etapaId`: string ('etapa1', 'etapa2', etc.)
- `categorieId`: string
- `status`: 'neinceput' | 'in_curs' | 'finalizat'
- `scoruri`: JSON (`{ "criteriu_1": 10, "criteriu_2": 8 }`)
- `scorFinal`: number (Calculat automat)
- `observatii`: JSON (`{ "criteriu_1": "Comentariu..." }`)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### `GlobalSettings` (Configurare)
- `isAnonymized`: boolean (Toggle global pentru jurați)
- `activeStage`: string
- `submissionDeadline`: Date

---

## 2. 🔌 Endpoint-uri API (Backend Design)

Pentru viitoarea implementare backend (Node.js/Python), propunem următoarele rute:

### Gestionare Asignări
- `POST /api/assignments/bulk`
  - Body: `{ candidatIds: [], juratIds: [], etapaId: string, categorieId: string }`
  - Descriere: Creează produsul cartezian al asignărilor, ignorând duplicatele.
- `POST /api/assignments/import`
  - Body: `{ file: CSV/Excel }`
  - Descriere: Procesează fișierul și creează asignări.
- `GET /api/reports/workload`
  - Descriere: Returnează statistici per jurat (nr. dosare/etapă).

### Portal Jurizare
- `GET /api/judge/candidates`
  - Query: `?etapa=X&status=Y`
  - Header: `x-anonymized: true/false` (Controlat de server based on GlobalSettings)
  - Response: Lista candidaților (cu datele sensibile ascunse dacă e anonim).
- `POST /api/judge/evaluate/:assignmentId`
  - Body: `{ scoruri: {}, observatii: {}, status: 'finalizat'|'draft' }`

### Integrări (Webhooks & Services)
- `POST /api/webhooks/hubspot`
- `POST /api/webhooks/mailchimp`

---

## 3. 🧩 Integrări Externe (HubSpot & Mailchimp)

### Design Servicii
Vom folosi un pattern de **Event Bus** (sau simplu Observer) în backend. Când o acțiune critică are loc (ex: `FORM_SUBMITTED`), se declanșează un eveniment.

#### Flux: Înscriere Director
1. Director trimite formular (`formular/App.tsx`).
2. Backend salvează datele.
3. Backend emite event: `CANDIDATE_CREATED`.
4. **HubSpot Service** ascultă evenimentul:
   - Caută contact după email.
   - Dacă nu există -> Create Contact.
   - Dacă există -> Update Contact properties (`role='director'`, `status='inscris'`, `regiune=...`).
5. **Mailchimp Service** ascultă evenimentul:
   - Adaugă email în lista "Directori 2026".
   - Trigger Automation Email: "Confirmare înscriere".

#### Flux: Înregistrare Jurat
1. Jurat completează formular (`formular-jurat/App.tsx`).
2. Backend emite event: `JUDGE_REGISTERED`.
3. **HubSpot Service**: Create/Update contact (`role='jurat'`).
4. **Mailchimp Service**: Adaugă în lista "Jurați 2026".

### Cod Propus (Serviciu Mock)

```typescript
// services/integrationService.ts

interface ContactData {
  email: string;
  nume: string;
  prenume: string;
  rol: 'director' | 'jurat';
  metadata: Record<string, any>;
}

export const syncToHubSpot = async (data: ContactData) => {
  console.log(`[HubSpot] Syncing contact: ${data.email}`, data);
  // Aici ar fi call-ul real către API-ul HubSpot
  // await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', ...);
  return true;
};

export const syncToMailchimp = async (data: ContactData, listId: string) => {
  console.log(`[Mailchimp] Adding to list ${listId}: ${data.email}`);
  // Aici ar fi call-ul real către API-ul Mailchimp
  return true;
};
```

---

## 4. 📱 UX/UI & Responsive Design

### Breakpoints
- **Mobile (< 640px):**
  - Tabelele complexe (Matrix) devin card-uri sau liste scrollabile orizontal.
  - Meniul devine "Hamburger".
  - Filtrele se mută într-un "Drawer" sau "Modal".
- **Tablet (640px - 1024px):**
  - Grid-uri de 2 coloane.
  - Sidebar-ul poate fi colapsabil.
- **Desktop (> 1024px):**
  - Grid-uri de 3-4 coloane.
  - Tabele complete vizibile.

### Îmbunătățiri UX Propuse
1. **Bulk Actions:** Checkbox-uri pe rânduri în liste, cu "Floating Action Bar" (apare doar când selectezi ceva) -> "Asignează", "Șterge", "Exportă".
2. **Jurat Dashboard:** Card-uri cu "Progres Personal" (ex: "Ai evaluat 3/10 candidați").
3. **Admin Matrix:** Sticky Header și Sticky First Column (Nume Candidat) pentru navigare ușoară în tabele mari.

---

## 5. 🔒 Toggle Anonimizare (Logica)

### Implementare Frontend
1. **Global State:** `isAnonymized` în `App.tsx`.
2. **Context:** Transmis prin props către `JudgeView`.
3. **Componenta `CandidateCard`:**
   ```typescript
   const displayName = isAnonymized ? `Candidat ${candidate.id}` : candidate.nume;
   const displaySchool = isAnonymized ? 'Unitate de învățământ' : candidate.scoala;
   // Regiunea rămâne vizibilă pentru context
   ```
4. **Admin Control:** Un switch simplu în header-ul sau dashboard-ul de admin.

