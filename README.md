# Platformă Jurizare - Gala Directorii Anului (v2.2)

Platformă completă pentru gestionarea procesului de jurizare, înscrieri și evaluare pentru Gala Directorii Anului.

## 🚀 Funcționalități Cheie

### 🏠 Portal Unificat
- **Home Page**: 3 puncte de intrare dedicate (Director, Jurat, Administrator).
- **Design Modern**: Interfață responsive, temă dark/light, accesibilă.

### 🎨 UI & UX
- **UI Kit**: Componente standardizate (`components/ui`) pentru consistență vizuală (Button, Badge, Alert, Input).
- **Notificări**: Sistem centralizat de notificări tip Toast (`NotificationContext`).
- **Responsive**: Optimizare completă pentru dispozitive mobile și tablete.

### 🔐 Panou Administrator
- **Dashboard Avansat**: Widget-uri pentru Activitate Recentă, Evaluări la Risc, Distribuție Scoruri.
- **Management Complet**:
  - Gestionare candidați, jurați și asignări.
  - Configurare etape și categorii.
  - Audit Logs pentru trasabilitate.
- **Export Date**: Filtre avansate (Etapă, Categorie, Status) și export CSV.

### ⚖️ Portal Jurat
- **Evaluare Simplificată**: Listă clară de asignări cu statusuri vizuale.
- **Scoring Panel**:
  - Auto-save cu feedback vizual (Saving/Saved).
  - Progress bar pentru completarea criteriilor.
  - Confidențialitate (ascundere medii globale).

### 📝 Formulare
- **Înscriere Director**: Formular complex integrat (`formular/`).
- **Înscriere Jurat**: Aplicație dedicată pentru onboarding jurați (`formular-jurat/`).

---

## 📂 Structură Proiect

```bash
AVE-Romania-V3/
├── components/          # Componente React
│   ├── ui/              # UI Kit (reutilizabile)
│   ├── shared/          # Componente partajate (CandidateCard, ScoringPanel)
│   └── ...              # Vederi (AdminView, JudgeView, Dashboard)
├── documentation/       # Documentație tehnică (.md)
│   ├── ARCHITECTURE_V2.md
│   └── INTEGRATION_GUIDE.md

├── formular/            # Aplicația de înscriere directori (integrată)
├── formular-jurat/      # Aplicația de înscriere jurați (standalone)
└── supabase/            # Migrări și configurări SQL
```

## 🛠️ Pornire Rapidă

### Cerințe
- Node.js (v18+)
- NPM

### Instalare și Rulare

1. **Platforma Principală**
```bash
npm install
npm run dev
```
Accesează: `http://localhost:3000` sau orice alt port disponibil

2. **Formular Jurat (Development)**
Dacă lucrezi la modulul de înscriere jurați:
```bash
cd formular-jurat
npm install
npm run dev
```

### Build pentru Producție

```bash
npm run build
```
Comanda va construi atât platforma principală cât și formularul de jurați, integrându-le în folderul `dist/`.

---

## 📚 Documentație

Toată documentația tehnică a fost mutată în folderul `documentation/`:
- **[ARCHITECTURE_V2.md](documentation/ARCHITECTURE_V2.md)**: Detalii arhitecturale.
- **[HOME_PAGE_DOCUMENTATION.md](documentation/HOME_PAGE_DOCUMENTATION.md)**: Documentație pentru pagina principală.
- **[home_quick_start.md](documentation/home_quick_start.md)**: Ghid de utilizare rapidă pentru pagina principală.
- **[integration_architecture.md](documentation/integration_architecture.md)**: Arhitectură de integrare module.
- **[jurat_form_complete.md](documentation/jurat_form_complete.md)**: Documentație completă pentru formularul de înscriere jurați.
- **[platform_status_report.md](documentation/platform_status_report.md)**: Raport de status platformă.

## 💾 Date și Persistență

- **Mod Demo**: Utilizează `localStorage` pentru date temporare (candidați, jurați, scoruri).
- **Resetare**: Execută `localStorage.clear()` în consola browserului pentru a reveni la starea inițială.
- **Supabase**: Configurat pentru autentificare și structură bază de date (vezi `supabase/migrations`).

## 🛠 Tehnologii

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (via PostCSS)
- **Data**: Supabase (Auth/DB), localStorage (Fallback/Demo)
- **Utils**: PDF.js (Vizualizare documente), SheetJS (Export)
