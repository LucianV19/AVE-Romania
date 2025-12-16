# Formular Înscriere Jurat - Demo

Formular multi-step pentru înscrierea juraților la Gala Premiilor pentru Directorii Anului.

## Caracteristici

- **4 pași de completare**:
  1. Date personale (nume, email, telefon)
  2. Experiență profesională (profesie, organizație, domeniu expertiză)
  3. Motivație și fotografie
  4. Revizuire și acord GDPR

- **Validări complete** pentru toate câmpurile
- **Salvare progres** automată în localStorage
- **Design responsive** pentru toate dispozitivele
- **Funcționare offline** - nu necesită conexiune internet

## Mod de Funcționare

### Salvare Date
Când formularul este trimis:
1. Datele sunt validate
2. Se creează un obiect cu toate informațiile
3. Se salvează în `localStorage` sub cheia `juryRegistrations`
4. Utilizatorul primește confirmare de succes

### Accesare Date
Datele înregistrate pot fi vizualizate și gestionate din:
- **Platforma principală** → Panou Administrare → tab "Înscrieri Jurați"

## Instalare și Rulare

```bash
npm install
npm run dev     # Development
npm run build   # Production build
```

## Tehnologii

- React 19
- TypeScript
- Vite
- Tailwind CSS (via CDN)
- localStorage pentru persistență

## Note

- Acest formular funcționează **100% local** (demo)
- Nu necesită backend sau bază de date
- Datele sunt salvate în browser (localStorage)
- Pentru producție, înlocuiți localStorage cu API calls
