# Changelog

Toate modificările notabile aduse acestui proiect vor fi documentate în acest fișier.

## [Unreleased]

### Adăugat
- **UI Kit**: Componente reutilizabile standardizate în `components/ui` (`Button`, `Badge`, `Alert`, `Input`, `Card`).
- **Notification System**: Sistem centralizat de notificări (`NotificationContext`) cu suport pentru Toast messages.
- **Admin Dashboard Widgets**:
  - Widget "Activitate Recentă" bazat pe audit logs.
  - Widget "Evaluări la Risc" pentru monitorizarea progresului juraților.
  - Widget "Distribuție Scoruri" pentru vizualizarea mediilor pe categorii.
- **Export Avansat**: Opțiuni de filtrare pentru exportul de asignări și candidați (status, categorie).
- **Feedback Jurat**: Indicatori vizuali pentru progresul evaluării (criterii completate) și statusul auto-save în `ScoringPanel`.

### Îmbunătățit
- **AdminView**: Refactorizare vizuală folosind componentele din UI Kit pentru consistență și lizibilitate.
- **JudgeView**: Standardizare vizuală a cardurilor de candidați și a filtrelor.
- **ScoringPanel**: Feedback vizual mai clar pentru acțiunile de salvare.
- **Accesibilitate**: Ajustări de contrast pentru Dark Mode.

### Fixat
- Inconsistențe vizuale între diferite secțiuni ale aplicației.
