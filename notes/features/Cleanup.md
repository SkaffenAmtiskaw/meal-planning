# Cleanup

Technical debt and refactoring notes for the project.

## Shared Types Directory

**Status:** Future refactoring

**Context:** During implementation of [Transfer Ownership of Planner](Transfer%20Ownership%20of%20Planner.md), the `PlannerWithAccess` type was created in `src/_actions/planner/getPlanners.ts`. This type is a DTO (Data Transfer Object) that combines planner data with access level information. The question arose: where should shared DTOs/types live?

**Problem:**
- Action files exporting types breaks separation of concerns
- UI components importing types from deeply nested action files is messy
- `_models/` is for database schema types, not view/DTO types
- No clear convention exists for shared DTOs/view models

**Proposed Solution:** Create a `src/_types/` directory

### What Belongs in `_types/`

1. **DTOs** - Data Transfer Objects that combine data from multiple sources
2. **View Models** - Shapes of data sent to UI components
3. **API Types** - Types shared between client and server
4. **Cross-domain Types** - Types that reference multiple domain models

### What Does NOT Belong in `_types/`

1. **Database Schema Types** - Keep in `_models/`
2. **Component Props** - Keep colocated with components
3. **Internal Action Types** - Keep in action files if only used there
4. **Third-party Type Mappings** - Keep in `_utils/` or feature folders

### Directory Rules

1. **TypeScript Only** - `.ts` files only, no `.tsx` (no JSX)
2. **No Unit Tests** - Types are tested via TypeScript compiler in consuming code
3. **Zod Schemas Optional** - May include Zod schemas if validation is needed
4. **Flat Structure** - Use filename prefixes (e.g., `planner.dto.ts`, `planner.api.ts`)
5. **Export Pattern** - Re-export from `index.ts` like `_models/`
6. **No Business Logic** - Pure type definitions only

### Example Structure

```
src/_types/
├── index.ts
├── planner.dto.ts       # DTOs for planner responses
├── planner.api.ts       # API request/response types
└── shared.ui.ts         # Common UI prop types
```

### Migration Candidates

1. `PlannerWithAccess` from `src/_actions/planner/getPlanners.ts`
2. Any DTOs defined in action files
3. Shared prop types currently duplicated across components

### Action Items

- [ ] Create `src/_types/` directory
- [ ] Define the directory rules
- [ ] Update `.opencode/docs/project_conventions.md` with `_types/` guidelines (create the file if it doesn't exist)
- [ ] Identify and migrate existing DTO types
- [ ] Update imports across the codebase
# Replicated React Hooks
- the async hook could be replaced with a native React hook

# Confirm Button
- doesn't do anything when useAsyncStatus has an actual exception - this seems incorrect?

# Date Utils
- replace date utils with luxon

# Better Route Management
- Emails create paths & query params that the application should correctly consume - but nothing keeps them in sync

# Switching Testing Library
- switch to vitest-browser-react

# InviteSettings.tsx
- If the user is undefined - shouldn't it not render anything? (Shouldn't the user always be defined? It's in settings.)

# Global Domain-Specific Components/Utils
- components and utils that have domain knowledge but are still used throughout the app should be moved to `src/app/_components`/`src/app/_utils` and an alias should be created for them - the project conventions should be updated to clearly spell out what sort of content goes in each of them
- access colors, etc.

# InviteForm.tsx
- using email regex rather than zod type check

# Recipe Detail Component
- swallows errors when recipe is deleted