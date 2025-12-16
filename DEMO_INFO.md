# Platformă Jurizare - Versiune Demo

Această platformă funcționează în modul **DEMO** fără conexiune la bază de date.

## Funcționare

### Date Temporare
Toate datele sunt salvate local în **localStorage** al browser-ului:
- Date candidați
- Date jurați
- Asignări și scoruri
- Audit logs
- Configurări competiție

### Persistență
- Datele rămân disponibile atâta timp cât nu este șters localStorage
- La închiderea și redeschiderea aplicației, datele sunt păstrate
- Pentru resetarea completă, ștergeți datele din localStorage prin Developer Tools

## Formularul de Înscriere Jurați

### Acces
Formularul este disponibil prin butonul **"Înscriere Jurat"** din header.

### Salvare Date
Când un jurat completează formularul:
1. Datele sunt validate
2. Se salvează în `localStorage` sub cheia `juryRegistrations`
3. Înregistrarea apare imediat în panoul de administrare

### Panou Administrare
Din secțiunea **"Înscrieri Jurați"** în AdminView poți:
- Vizualiza toate înscrierile
- Filtra după status (În așteptare / Aprobat / Respins)
- Căuta după nume, email sau profesie
- Edita informațiile
- Schimba statusul înregistrărilor
- Șterge înregistrări
- Exporta în format CSV

## Date Demo Pre-încărcate

Platforma vine cu date demo pre-configurate:
- 6 candidați
- 4 jurați
- Multiple asignări și scoruri
- Etape și categorii de competiție
- Criterii de evaluare

## Limitări Demo

- Nu există sincronizare între dispozitive
- Datele sunt locale fiecărui browser
- Nu există backup automat
- Storage limitat la capacitatea localStorage (aprox. 5-10MB)

## Pentru Producție

Pentru o versiune de producție cu bază de date reală:
1. Configurați Supabase sau alt backend
2. Înlocuiți apelurile localStorage cu API calls
3. Implementați autentificare reală
4. Adăugați backup și sincronizare

---

**Notă**: Această versiune este destinată doar pentru demonstrație și testare locală.
