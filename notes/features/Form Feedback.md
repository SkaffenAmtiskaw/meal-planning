- form validation errors should be clearly indicated to the user when they press submit - look up UX best practices to see if the button should be disabled until errors are fixed
- when a user submits a form the submit button should disable and have a spinner indicating the form is submitting
- if the form submission is successful, the button should turn green and and indicate form submission was successful - it should also display a countdown for auto-closing the modal
- after a successful submit the modal should close at the end of the countdown
- if the form submission was unsuccessful an alert should be displayed at the top of the page indicating it was unsuccessful - the form modal should not automatically close
- shared functionality should be pulled into reusable hooks/components

---

<!-- Claude-generated plan -->

## Context

Forms and the delete confirm modal currently have no feedback during or after async operations. Submit errors are silently swallowed, success just closes the modal without acknowledgement, and there's no visual loading state on the submit button. This plan adds a consistent feedback layer across all async actions: loading spinner during submission, green success state with countdown auto-close, and an error alert when the operation fails.

## UX Decision: Disabled Button

Best practice is to **keep the submit button enabled** and show field-level validation errors on submit (which Mantine already does via `form.onSubmit`). The button is only disabled while a submission is in flight to prevent duplicate submits.

## Implementation Plan

### Step 1 — `useFormFeedback` hook ✅

**Goal:** Core logic for the feedback lifecycle. All state lives here.

**Create:**
- `src/_hooks/useFormFeedback/useFormFeedback.ts`
- `src/_hooks/useFormFeedback/useFormFeedback.test.ts`
- `src/_hooks/useFormFeedback/index.ts`

**Update:** `src/_hooks/index.ts` — re-export `useFormFeedback`

**Key implementation details:**
- State: `status: 'idle' | 'submitting' | 'success' | 'error'`, `countdown: number`, `errorMessage: string | undefined`
- Options: `{ successDuration?: number }` (default `3000`ms). If `0`, skip the `'success'` state and call `onSuccess` immediately (used by delete).
- `wrap(fn: () => Promise<void>, onSuccess: () => void)` — sets `status = 'submitting'`, on resolve starts 1s interval decrementing countdown (initialized to `successDuration / 1000`), calls `onSuccess` when countdown hits 0, on reject sets `status = 'error'` with caught message.
- `reset()` — returns all state to idle defaults.

**Success criteria** (no manual testing possible — not wired to UI yet):
- `pnpm test:coverage` passes with 100% coverage on the new hook
- `wrap` transitions: idle → submitting → success → (countdown) → calls onSuccess
- `wrap` on rejection: idle → submitting → error, `errorMessage` contains thrown message
- `successDuration: 0` calls `onSuccess` immediately, never enters `'success'` state
- Countdown decrements once per second from `successDuration / 1000` to 0
- `reset()` returns `status` to `'idle'` and clears `errorMessage`

---

### Step 2 — `SubmitButton` component ✅

**Goal:** Reusable button that reflects all four submit states.

**Create:**
- `src/_components/SubmitButton/SubmitButton.tsx`
- `src/_components/SubmitButton/SubmitButton.test.tsx`
- `src/_components/SubmitButton/index.ts`

**Update:** `src/_components/index.ts` — re-export `SubmitButton`

**Key implementation details:**
- Props: `status: 'idle' | 'submitting' | 'success' | 'error'`, `countdown: number`, `label: string`
- `idle` / `error`: enabled, `type="submit"`, shows `label`
- `submitting`: `loading` prop, disabled
- `success`: `color="green"`, disabled, shows `"Saved! Closing in {countdown}…"`

**Success criteria** (no manual testing possible — not wired to UI yet):
- `pnpm test:coverage` passes with 100% coverage
- Renders `label` in idle and error states
- Renders loading indicator and is disabled in submitting state
- Renders green button with countdown text in success state
- Is disabled in submitting and success states; enabled in idle and error states

---

### Step 3 — `FormFeedbackAlert` component ✅

**Goal:** Reusable error alert to sit at the top of any form or modal.

**Create:**
- `src/_components/FormFeedbackAlert/FormFeedbackAlert.tsx`
- `src/_components/FormFeedbackAlert/FormFeedbackAlert.test.tsx`
- `src/_components/FormFeedbackAlert/index.ts`

**Update:** `src/_components/index.ts` — re-export `FormFeedbackAlert`

**Key implementation details:**
- Props: `status: 'idle' | 'submitting' | 'success' | 'error'`, `errorMessage: string | undefined`
- Renders a red Mantine `Alert` with an error icon only when `status === 'error'`; renders `null` otherwise

**Success criteria** (no manual testing possible — not wired to UI yet):
- `pnpm test:coverage` passes with 100% coverage
- Renders `null` for `idle`, `submitting`, and `success` status
- Renders a visible alert containing `errorMessage` when `status === 'error'`

---

### Step 4 — Wire into `RecipeForm` ✅

**Goal:** Recipe add/edit form uses the shared feedback layer end-to-end.

**Update:**
- `src/app/[planner]/recipes/_components/Modal/RecipeForm.tsx`
- `src/app/[planner]/recipes/_components/Modal/RecipeForm.test.tsx`

**Key implementation details:**
- Call `useFormFeedback()` (default 3s countdown); destructure `status`, `countdown`, `errorMessage`, `wrap`
- Wrap `handleSubmit`: `form.onSubmit(wrap(async (values) => { ... }, () => router.push(pathname)))`
- Add `<FormFeedbackAlert status={status} errorMessage={errorMessage} />` above `<Grid>`
- Replace `<Button type="submit">` with `<SubmitButton status={status} countdown={countdown} label={item ? 'Save' : 'Add Recipe'} />`

**Manual test checklist:**
- [ ] Open "Add Recipe", leave Title blank, click "Add Recipe" — field error appears on the Title input, modal stays open
- [ ] Fill in Title, click "Add Recipe" — button shows spinner and is disabled while submitting
- [ ] After successful submit — button turns green, shows "Saved! Closing in 3…", counts down to 0, modal closes
- [ ] (Simulate error) Temporarily make `addRecipe` throw — red alert appears at top of form with error message, modal stays open, button re-enables so the user can retry

---

### Step 5 — Wire into delete flow ✅

**Goal:** Delete confirm modal surfaces errors and disables the button while in flight.

**Update:**
- `src/app/[planner]/recipes/_components/DeleteRecipeButton.tsx`
- `src/app/[planner]/recipes/_components/DeleteRecipeButton.test.tsx`
- `src/app/[planner]/recipes/_components/DeleteConfirmModal.tsx`
- `src/app/[planner]/recipes/_components/DeleteConfirmModal.test.tsx`

**Key implementation details:**
- `DeleteRecipeButton`: replace manual `loading`/`setLoading` with `useFormFeedback({ successDuration: 0 })`; `onSuccess` calls `setOpened(false)` + `router.refresh()`; pass `errorMessage` to `DeleteConfirmModal`
- `DeleteConfirmModal`: add `errorMessage?: string` prop; render `<FormFeedbackAlert status={errorMessage ? 'error' : 'idle'} errorMessage={errorMessage} />` above the button group; derive `loading` from the existing `loading` prop (keep that prop as-is)

**Manual test checklist:**
- [ ] Click delete on a recipe — Delete button shows spinner and both buttons are disabled while deleting
- [ ] After successful delete — modal closes immediately, recipe is removed from the list
- [ ] (Simulate error) Temporarily make `deleteRecipe` throw — red alert appears inside the modal with error message, modal stays open, Delete button re-enables so the user can retry

---

## Files Changed

| File | Step | Action |
|---|---|---|
| `src/_hooks/useFormFeedback/useFormFeedback.ts` | 1 | Create |
| `src/_hooks/useFormFeedback/useFormFeedback.test.ts` | 1 | Create |
| `src/_hooks/useFormFeedback/index.ts` | 1 | Create |
| `src/_hooks/index.ts` | 1 | Update |
| `src/_components/SubmitButton/SubmitButton.tsx` | 2 | Create |
| `src/_components/SubmitButton/SubmitButton.test.tsx` | 2 | Create |
| `src/_components/SubmitButton/index.ts` | 2 | Create |
| `src/_components/FormFeedbackAlert/FormFeedbackAlert.tsx` | 3 | Create |
| `src/_components/FormFeedbackAlert/FormFeedbackAlert.test.tsx` | 3 | Create |
| `src/_components/FormFeedbackAlert/index.ts` | 3 | Create |
| `src/_components/index.ts` | 2–3 | Update |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.tsx` | 4 | Update |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.test.tsx` | 4 | Update |
| `src/app/[planner]/recipes/_components/DeleteRecipeButton.tsx` | 5 | Update |
| `src/app/[planner]/recipes/_components/DeleteRecipeButton.test.tsx` | 5 | Update |
| `src/app/[planner]/recipes/_components/DeleteConfirmModal.tsx` | 5 | Update |
| `src/app/[planner]/recipes/_components/DeleteConfirmModal.test.tsx` | 5 | Update |

## Verification

- `pnpm lint` — passes with no errors
- `pnpm test:coverage` — passes with 100% coverage across all new and updated files
- Manual tests from Steps 4 and 5 all pass
