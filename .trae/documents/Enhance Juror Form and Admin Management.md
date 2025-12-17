# Plan: Enhance Juror Form and Admin Management

## 1. Update Data Models
### `types.ts`
- Update `Jurat` interface to include extended profile fields: `email`, `telefon`, `profesie`, `organizatie`, `experienta`, `domeniu_expertiza`, `ani_experienta`, `linkedin_url`, `facebook_url`, `instagram_url`, `motivatie`, `foto_url`, `password`.

### `formular-jurat/types.ts`
- Add `password` to `JuryFormData` interface.

## 2. Refactor Juror Registration Form (`formular-jurat/App.tsx`)
- **Single Page Layout**: Remove the multi-step wizard logic (`currentStep`, `handleNext`, `handlePrev`). Render all form sections sequentially in one scrollable view.
- **Password Field**: Add a new input field for `password` in the "Date Personale" or a new "Securitate" section.
- **Submission**: Update `handleSubmit` to include the password in the `juryRegistrations` object saved to `localStorage`.

## 3. Update Data Synchronization (`App.tsx`)
- Modify the `checkForNewSubmissions` function to fully populate the `Jurat` object when creating a new judge from a registration. It will now map all the new fields (email, phone, password, socials, etc.) instead of just the name.

## 4. Enhance Admin Juror Management (`components/AdminView.tsx`)
- **Delete Capability**: Add a "Delete" button to each judge item in the "Management Jurați" list (similar to the candidate delete button).
- **Full Editing**: Expand the `JuratEditModal` to include inputs for **ALL** judge fields (Email, Phone, Profession, Organization, Social Media links, Motivation, etc.), not just the name.
- **Data Export**: Add an "Export CSV" button to the "Management Jurați" section that downloads the full list of judges with all their details.
