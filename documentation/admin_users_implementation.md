# Admin Users Page: Step-by-Step Implementation Guide

## 1. Create the Page Structure
- [x] Create `app/admin/users/page.tsx` for the main admin users page.
- [x] Ensure it uses the `app/admin/layout.tsx` for consistent admin navigation/header.

## 2. Design the UI/UX
- [x] Add a page header: `Manage Users`.
- [x] Display a table or card list of all users:
    - Columns: Name, Email, Role, Status, Date Joined, Actions (View, Edit, Delete, Suspend)
- [x] Add a prominent `Add User` button (if admin can create users).
- [x] Implement an edit/view modal or drawer with a form for all user fields.
- [x] Add a delete/suspend confirmation dialog.

## 3. Data Management (Supabase/Clerk Integration)
- [x] Create `lib/supabase/services/user-service.ts` if it doesn't exist.
- [x] Implement the following service functions:
    - `getAllUsers(): Promise<User[]>`
    - `getUserById(id: string): Promise<User | null>`
    - `createUser(data: UserInput): Promise<User>` (if admin can create users)
    - `updateUser(id: string, data: UserInput): Promise<User>`
    - `deleteUser(id: string): Promise<void>`
    - `suspendUser(id: string): Promise<User>` (if applicable)
- [x] Use these functions in the page to fetch, create, update, delete, and suspend users.

## 4. Build the User Form
- [x] Use React Hook Form (or similar) for form state and validation.
- [x] Fields:
    - Name (required)
    - Email (required, valid email)
    - Role (dropdown/select)
    - Status (dropdown/select)
    - Any other relevant fields
- [x] Show inline validation errors for missing/invalid fields.

## 5. Implement Feedback & Notifications
- [x] Use a toast/notification system for success/error messages (e.g., Shadcn UI toast, Sonner, or custom).
- [x] Show loading spinners or skeletons while fetching or submitting data.

## 6. Access Control
- [x] Ensure only authenticated admins can access this page and perform actions (use Clerk and/or middleware).

## 7. Best Practices
- [x] Use strict TypeScript types/interfaces for all data and API responses.
- [x] Break the page into reusable components:
    - `UserTable`
    - `UserForm`
    - `UserModal`
    - `DeleteConfirmationDialog`
- [x] Ensure accessibility for all forms, buttons, and dialogs.

## 8. Testing & Validation
- [x] Test all CRUD operations (add, edit, delete, fetch, suspend users).
- [x] Test form validation and error handling.
- [x] Test UI responsiveness and accessibility.
- [x] Test access control (only admins can access).

---

## Example File Structure
```
app/
  admin/
    users/
      page.tsx
lib/
  supabase/
    services/
      user-service.ts
components/
  admin/
    users/
      UserTable.tsx
      UserForm.tsx
      UserModal.tsx
      DeleteConfirmationDialog.tsx
```

---

## Example Service Function Signatures (TypeScript)
```ts
// lib/supabase/services/user-service.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
}

export async function getAllUsers(): Promise<User[]> { /* ... */ }
export async function getUserById(id: string): Promise<User | null> { /* ... */ }
export async function createUser(data: UserInput): Promise<User> { /* ... */ }
export async function updateUser(id: string, data: UserInput): Promise<User> { /* ... */ }
export async function deleteUser(id: string): Promise<void> { /* ... */ }
export async function suspendUser(id: string): Promise<User> { /* ... */ }
```

---

## UI/UX Flow
1. **Page loads:** Fetch and display all users in a table/list.
2. **Add User:** Admin clicks `Add User`, modal/drawer opens with form. On submit, create user and refresh list.
3. **Edit/View User:** Admin clicks edit/view on a row, modal/drawer opens pre-filled. On submit, update user and refresh list.
4. **Delete/Suspend User:** Admin clicks delete/suspend, confirmation dialog appears. On confirm, delete/suspend user and refresh list.
5. **Feedback:** Show toasts for all success/error actions. Show loading indicators as needed.

---

## Checklist for Completion
- [x] Page and layout structure created
- [x] UI/UX matches requirements
- [x] All CRUD service functions implemented
- [x] Form validation and error handling in place
- [x] Feedback and loading states implemented
- [x] Access control enforced
- [x] Code is modular, typed, and accessible
- [x] All features tested and validated 