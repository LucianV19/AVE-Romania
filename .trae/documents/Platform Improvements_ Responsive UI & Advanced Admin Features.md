# Plan: Platform Analysis & Improvements for UX/UI and Admin Features

Based on the analysis of the codebase, here is the improvement plan focusing on Responsiveness (Mobile/Tablet) and Admin Complexity.

## 1. UI/UX & Responsiveness Improvements
### **A. Mobile Navigation (Header)**
- **Current Issue**: The header buttons ("Portal Jurat", "Clasament", etc.) and user controls clutter the screen on mobile devices.
- **Solution**: Implement a **Hamburger Menu** for mobile screens.
    - Move navigation links and user profile/theme toggle into a slide-out or dropdown menu on screens smaller than `md` (768px).
    - Ensure the "Director Registration" and "Juror Registration" buttons remain accessible but compact.

### **B. Responsive Admin Tables**
- **Current Issue**: The "Assignments & Scores Matrix" in the Admin Panel is very wide and difficult to scroll/view on mobile phones.
- **Solution**: Implement a **"Card View" mode** for mobile.
    - On mobile, instead of a large table, display a list of cards, each representing a Candidate with their assigned Judges and scores nested inside.
    - Use a CSS media query or React hook to switch between `Table` (Desktop) and `List/Cards` (Mobile).

## 2. Advanced Admin Features (Complexity & Ease of Use)
### **C. Admin Dashboard (New Tab)**
- **Feature**: Add a high-level **"Dashboard"** tab as the default landing page for Admins.
- **Metrics to Display**:
    - **Progress Overview**: Circular progress bar showing total completion % of all evaluations.
    - **Judge Activity**: List of "Top Active Judges" and "Judges with Pending Tasks" (Lagging).
    - **Category Stats**: Number of candidates per category.
    - **Quick Actions**: Buttons for "Add Candidate", "Invite Judge", "Export Report".
- **Benefit**: Provides immediate insight without digging into tables.

### **D. Smart Assignment Distribution (Algorithm)**
- **Feature**: Enhance the "Bulk Assignment" modal with a **"Smart Distribute"** option.
- **Logic**:
    - "Assign each candidate to **N** random judges".
    - "Ensure no judge evaluates the same candidate twice".
    - "Load balancing": Ensure judges get roughly equal numbers of candidates.
- **Benefit**: Saves hours of manual clicking for large competitions.

## Implementation Steps
1.  **Refactor `Header.tsx`**: Add `MenuIcon` and mobile drawer logic.
2.  **Create `Dashboard.tsx`**: Implement the statistics view using existing data (`assignments`, `judges`, `candidates`).
3.  **Update `AdminView.tsx`**:
    - Integrate the `Dashboard` component.
    - Add "Smart Distribute" logic to `BulkAssignmentModal`.
    - Implement mobile-friendly rendering for the Assignment Matrix.
