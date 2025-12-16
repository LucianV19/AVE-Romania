# Platformă Jurizare - Gala Directorii Anului

Platformă completă pentru jurizare în modul DEMO (fără bază de date).

## Pornire Rapidă

### Development Mode

Pentru development, trebuie să rulezi **2 servere separat**:

#### 1. Platforma Principală
```bash
npm install
npm run dev
```
Accesează: `http://localhost:5173`

#### 2. Formularul de Înscriere Jurat
```bash
cd formular-jurat
npm install
npm run dev
```
Accesează: `http://localhost:5174` (sau portul afișat în terminal)

### Production Build

Pentru a genera build-ul final (toate fișierele în `dist/`):

```bash
npm install
npm run build
```

Acest command va:
1. Construi platforma principală
2. Construi formularul jurat
3. Copia formularul în `dist/formular-jurat/`

După build, poți servi întregul site cu:
```bash
npm run preview
```

## Structură

```
project/
├── components/          # Componente platformă principală
├── formular-jurat/      # Aplicație separată pentru înscriere jurați
│   ├── components/      # Componente formular
│   └── dist/           # Build formular
├── dist/               # Build platformă principală
│   └── formular-jurat/ # Formular copiat aici la build
└── README.md
```

## Funcționalități

### Platformă Principală
- **Judge View**: Evaluare candidați de către jurați
- **Leaderboard**: Clasament candidați
- **Admin View**:
  - Gestionare competiție
  - Asignare jurați
  - **Înscrieri Jurați**: Gestionare înscrieri din formular
- **Documentation**: Ghid complet utilizare

### Formular Înscriere Jurat
- Formular multi-step (4 pași)
- Validări complete
- Salvare progres automată
- Trimitere date în localStorage
- Design responsive

## Date Demo

Toate datele sunt salvate în **localStorage**:
- `candidatesData`: Candidați (6 demo)
- `judgesData`: Jurați (4 demo)
- `judgeAssignments`: Asignări
- `judgingScores`: Scoruri evaluare
- `juryRegistrations`: Înscrieri noi jurați (3 demo)
- `auditLogs`: Istoric acțiuni
- `competitionSettings`: Configurări

## Resetare Date

Pentru a reseta toate datele demo:

```javascript
// În Developer Console (F12)
localStorage.clear();
location.reload();
```

## Tehnologii

- **React 19** + TypeScript
- **Vite** pentru build
- **Tailwind CSS** via CDN
- **PDF.js** pentru afișare documente
- **localStorage** pentru persistență (demo mode)

## Note Importante

1. În **development**, trebuie să rulezi ambele servere separat
2. Butonul "Înscriere Jurat" din platformă va funcționa doar după **build**
3. Pentru testing în dev, accesează direct formularul pe portul său
4. Toate datele sunt locale și temporare (localStorage)

## Documentație Completă

Vezi fișierele:
- `DEMO_INFO.md` - Detalii modul demo
- `formular-jurat/README.md` - Detalii formular
- Tab "Documentation" în platformă - Ghid utilizare complet
