# Cleanup

Technical debt and refactoring notes for the project.

## Shared Types Directory

**Status:** Future refactoring

**Context:** During implementation of [Shared Planners](./Shared%20Planners.md), the `PlannerWithAccess` type was created in `src/_actions/planner/getPlanners.ts`. This type is a DTO (Data Transfer Object) that combines planner data with access level information. The question arose: where should shared DTOs/types live?

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

**Note:** Do not modify `.opencode/docs/project_conventions.md` until the `_types/` directory is actually created and populated. The conventions should document what exists, not what is planned.
