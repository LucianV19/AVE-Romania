I have analyzed the codebase and identified the issues. Here is the plan to fix the Dashboard and restructure the Admin interface for scalability.

# 1. Fix Empty Dashboard
**Issue:** The `Dashboard` component is imported but **never rendered** in `AdminView.tsx`. The tab selection logic updates the state but the `renderTabContent` function is missing the case for `'dashboard'`.
**Fix:**
- Update `AdminTab` type to include `'dashboard'`.
- Add `case 'dashboard': return <Dashboard {...props} />;` to `renderTabContent` in `AdminView.tsx`.

# 2. Reorganize "Competition Configuration"
**Issue:** Currently, `ConfigManagement` displays everything (Global Settings, Candidates, Judges) in a simple grid of cards, which is unmanageable for 500 candidates and 150 judges.
**Fix:** Refactor `ConfigManagement` to use a **Tabbed Layout**:
- **Tab 1: Structură & Setări**: Global settings (Deadlines, Anonymization), Stages, Categories, and Criteria.
- **Tab 2: Candidați**: A dedicated full-width view for managing candidates with:
    - Search & Filter bar.
    - Paginated or virtualized list (to handle 500+ items).
    - "Add/Edit/Delete" actions.
- **Tab 3: Jurați**: A dedicated full-width view for managing judges with:
    - Search & Filter bar.
    - Export CSV button.
    - List view with contact details and status.

# 3. Rethink "Assignments & Scores"
**Issue:** A 500x150 matrix (75,000 cells) is difficult to navigate horizontally.
**Fix:** Introduce a **"View Mode" Toggle** in `AssignmentManagement`:
1.  **Matrix View (Legacy)**: The current grid, but with improved column filtering (search judges to reduce horizontal scrolling).
2.  **Focus View (New)**: A Master-Detail layout:
    - **Sidebar**: List of Judges (searchable).
    - **Main Area**: When a judge is selected, show *only* their assigned candidates as a clean list/card grid.
    - **Why:** It's easier to manage "What does Judge X have to do?" than seeing everyone at once.
    - **Reverse Toggle**: Option to view "By Candidate" (Select Candidate -> See assigned Judges).

# 4. Implementation Steps
1.  **Modify `AdminView.tsx`**:
    - Fix the `Dashboard` rendering.
    - Update `ConfigManagement` to use the new tabbed structure.
    - Add the new "Structure", "Candidates", and "Judges" sub-components (or inline them if concise).
2.  **Modify `AssignmentManagement`**:
    - Add the `viewMode` state (Matrix vs Focus).
    - Implement the "Focus View" (Master-Detail).

This approach solves the scalability issue (500 candidates) by breaking the data into focused views rather than trying to show everything on one screen.
