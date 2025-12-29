Voi implementa o serie de îmbunătățiri funcționale și vizuale structurate în 3 faze principale, prioritizând impactul asupra experienței utilizatorului și stabilitatea aplicației.

### Faza 1: Fundație Vizuală & Standardizare (Visual Improvements)
**Obiectiv:** Creșterea consistenței vizuale și a lizibilității prin componente reutilizabile și un design system minimal.

1.  **Creare "UI Kit" Intern (`components/ui`)**:
    *   Voi extrage și standardiza componentele de bază: `Button`, `Badge` (deja început la CandidateCard), `Alert/Toast` (nou), `Input`.
    *   Voi refactoriza `Card.tsx` pentru a suporta variante (elevated, outlined, flat) consistente în dark/light mode.
2.  **Standardizare Interfețe**:
    *   **AdminView**: Voi aplica noile componente pentru a curăța tabelele și matricea de asignare (densitate controlată).
    *   **JudgeView**: Voi îmbunătăți ierarhia vizuală a listei de candidați (statut mai clar, progres vizibil).
3.  **Accesibilitate & Contrast**:
    *   Audit rapid pe culori în Dark Mode și ajustarea nuanțelor de text (`text-slate-400` -> `text-slate-300` unde e necesar).

### Faza 2: Îmbunătățiri Funcționale - Dashboard & Notificări
**Obiectiv:** Transformarea dashboard-ului într-un instrument operațional și îmbunătățirea feedback-ului sistemului.

1.  **Centru de Notificări (Notification Center)**:
    *   Implementare `NotificationContext` care monitorizează `auditLogs` și evenimente locale.
    *   Afișare notificări tip "Toast" pentru acțiuni reușite (salvare, trimitere) și erori.
    *   Listă "Notificări Recente" în Header pentru Admin (ex: "Jurat nou înscris", "Evaluare finalizată").
2.  **Dashboard Operațional (Admin)**:
    *   Adăugare widget **"Activitate Recentă"**: Ultimele 5 acțiuni din audit log.
    *   Adăugare widget **"Evaluări la Risc"**: Jurați cu progres < 50% aproape de deadline (simulat).
    *   Adăugare widget **"Distribuție Scoruri"**: Grafic simplu (CSS-based bar chart) pentru a vedea media pe categorii.

### Faza 3: Optimizare Procese & Raportare
**Obiectiv:** Eficientizarea muncii juraților și administratorilor.

1.  **Rapoarte Avansate (Export)**:
    *   Îmbunătățirea secțiunii "Export" din Admin cu filtre: "Exportă doar finalizate", "Exportă doar categoria X".
    *   Nume fișiere exportate cu timestamp clar (ex: `evaluari_finalizate_2025-10-20.csv`).
2.  **Feedback Vizual Progres (Jurat)**:
    *   În `ScoringPanel`, adăugarea unui indicator de progres granular (ex: "7/10 criterii completate") care se actualizează în timp real.
    *   Indicator vizual explicit pentru "Auto-save" (Salvat / Se salvează...).
3.  **Documentare**:
    *   Creare fișier `CHANGELOG.md` și documentarea tuturor modificărilor.

### Ordinea de Execuție Propusă
1.  **Setup UI Kit & Changelog** (Faza 1 - bază)
2.  **Refactor Admin Dashboard & Widgets** (Faza 2 - vizibilitate)
3.  **Implementare Notificări & Feedback Jurat** (Faza 2 & 3 - interactivitate)
4.  **Finalizare Standardizare Vizuală & Export** (Faza 1 & 3 - polish)
