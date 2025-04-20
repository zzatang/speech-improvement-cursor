# Admin Achievements Page: Step-by-Step Implementation Guide

## 1. Create the Page Structure
- [ ] Create `app/admin/achievements/page.tsx` for the main admin achievements page.
- [ ] Ensure it uses the `app/admin/layout.tsx` for consistent admin navigation/header.

## 2. Design the UI/UX
- [ ] Add a page header: `Manage Achievements`.
- [ ] Display a table or card list of all achievements:
    - Columns: Name, Description, Icon/Badge, Criteria, Actions (Edit/Delete)
- [ ] Add a prominent `Add Achievement` button.
- [ ] Implement an edit/create modal or drawer with a form for all achievement fields.
- [ ] Add a delete confirmation dialog.

## 3. Data Management (Supabase Integration)
- [ ] Create `lib/supabase/services/achievement-service.ts` if it doesn't exist.
- [ ] Implement the following service functions:
    - `getAllAchievements(): Promise<Achievement[]>`
    - `getAchievementById(id: string): Promise<Achievement | null>`
    - `createAchievement(data: AchievementInput): Promise<Achievement>`
    - `updateAchievement(id: string, data: AchievementInput): Promise<Achievement>`
    - `deleteAchievement(id: string): Promise<void>`
- [ ] Use these functions in the page to fetch, create, update, and delete achievements.

## 4. Build the Achievement Form
- [ ] Use React Hook Form (or similar) for form state and validation.
- [ ] Fields:
    - Name (required)
    - Description (required)
    - Icon/Badge (optional, file upload or icon picker)
    - Criteria (required, e.g., "Complete 10 exercises")
- [ ] Show inline validation errors for missing/invalid fields.

## 5. Implement Feedback & Notifications
- [ ] Use a toast/notification system for success/error messages (e.g., Shadcn UI toast, Sonner, or custom).
- [ ] Show loading spinners or skeletons while fetching or submitting data.

## 6. Access Control
- [ ] Ensure only authenticated admins can access this page and perform actions (use Clerk and/or middleware).

## 7. Best Practices
- [ ] Use strict TypeScript types/interfaces for all data and API responses.
- [ ] Break the page into reusable components:
    - `AchievementTable`
    - `AchievementForm`
    - `AchievementModal`
    - `DeleteConfirmationDialog`
- [ ] Ensure accessibility for all forms, buttons, and dialogs.

## 8. Testing & Validation
- [ ] Test all CRUD operations (add, edit, delete, fetch achievements).
- [ ] Test form validation and error handling.
- [ ] Test UI responsiveness and accessibility.
- [ ] Test access control (only admins can access).

---

## Example File Structure
```
app/
  admin/
    achievements/
      page.tsx
lib/
  supabase/
    services/
      achievement-service.ts
components/
  admin/
    achievements/
      AchievementTable.tsx
      AchievementForm.tsx
      AchievementModal.tsx
      DeleteConfirmationDialog.tsx
```

---

## Example Service Function Signatures (TypeScript)
```ts
// lib/supabase/services/achievement-service.ts
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  criteria: string;
}

export interface AchievementInput {
  name: string;
  description: string;
  icon_url?: string;
  criteria: string;
}

export async function getAllAchievements(): Promise<Achievement[]> { /* ... */ }
export async function getAchievementById(id: string): Promise<Achievement | null> { /* ... */ }
export async function createAchievement(data: AchievementInput): Promise<Achievement> { /* ... */ }
export async function updateAchievement(id: string, data: AchievementInput): Promise<Achievement> { /* ... */ }
export async function deleteAchievement(id: string): Promise<void> { /* ... */ }
```

---

## UI/UX Flow
1. **Page loads:** Fetch and display all achievements in a table/list.
2. **Add Achievement:** Admin clicks `Add Achievement`, modal/drawer opens with form. On submit, create achievement and refresh list.
3. **Edit Achievement:** Admin clicks edit on a row, modal/drawer opens pre-filled. On submit, update achievement and refresh list.
4. **Delete Achievement:** Admin clicks delete, confirmation dialog appears. On confirm, delete achievement and refresh list.
5. **Feedback:** Show toasts for all success/error actions. Show loading indicators as needed.

---

## Checklist for Completion
- [ ] Page and layout structure created
- [ ] UI/UX matches requirements
- [ ] All CRUD service functions implemented
- [ ] Form validation and error handling in place
- [ ] Feedback and loading states implemented
- [ ] Access control enforced
- [ ] Code is modular, typed, and accessible
- [ ] All features tested and validated 