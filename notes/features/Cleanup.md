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

## Deprecated Zod Types

**Status:** Technical debt

**Context:** During implementation of [Transfer Ownership of Planner](Transfer%20Ownership%20of%20Planner.md), discovered that `z.string().email()` is deprecated in Zod 4 in favor of `z.email()`.

**Files using deprecated pattern:**
- `src/_models/pendingInvite.types.ts` - `z.string().email()`
- `src/_models/user.types.ts` - `z.string().email()`
- `src/env.ts` - `z.string().email()`
- `src/_actions/user/requestEmailChange.ts` - `z.string().email()`

**Action Items:**
- [ ] Replace `z.string().email()` with `z.email()` in all files
- [ ] Audit codebase for other deprecated Zod patterns (check https://zod.dev/llms-full.txt for current API)
- [ ] Update all type definitions to use Zod 4 recommended patterns

**Note:** Do not modify `.opencode/docs/project_conventions.md` until the `_types/` directory is actually created and populated. The conventions should document what exists, not what is planned.

# Replicated React Hooks
- the async hook could be replaced with a native React hook

# Confirm Button
- doesn't do anything when useAsyncStatus has an actual exception - this seems incorrect?

# Date Utils
- replace date utils with luxon

# Better Route Management
- Emails create paths & query params that the application should correctly consume - but nothing keeps them in sync