# Tag Management

**Status**: Planning  
**Location**: Planner Settings  
**Priority**: Medium

---

## Feature Overview

Allow users to manage their planner's tags centrally. This includes:
- Viewing all tags in a planner
- Editing tag names
- Changing tag colors (from preset palette)
- Deleting unused tags
- Creating new tags directly
- Reordering tags via drag-and-drop

**Permissions**: Tag management is only available to users with **owner or admin** privileges on the planner. Users with read/write access cannot edit tags.

---

## Scope

### In Scope
- Tag list view within expandable planner section (owner/admin only)
- Inline tag name editing
- Color selection from existing 10-color palette
- Tag deletion with usage count warning
- Direct tag creation
- Tag reordering via drag-and-drop
- Mobile-responsive layout
- Permission-based access control

### Out of Scope (Future Considerations)
- Custom color creation (beyond the 10 presets)
- Tag merging
- Bulk operations
- Tag categories/groups
- Tag usage analytics

---

## Data Model

```typescript
interface Tag {
  _id: string;
  name: string;
  color: TagColor; // One of 10 preset colors
}

type TagColor = 
  | 'tangerine'
  | 'rosewood' 
  | 'honey'
  | 'fern'
  | 'seafoam'
  | 'steel'
  | 'lavender'
  | 'mauve'
  | 'sageMist'
  | 'slate';
```

---

## High-Level Overview

### Layout

The tag management interface lives **inside each planner's expandable section** within **Settings → Planner Settings**.

**Planner Settings Structure:**
```
Planner Settings Tab
└── PlannerList
    └── PlannerItem (expandable - owner/admin only)
        ├── Planner Header (name, share status, etc.)
        ├── Shared Users Section (future: Shared Planners story)
        └── Tags Section ← Tag Management lives here
            └── TagManagementPanel
```

*Note: The Shared Users Section is planned work for the [[Transfer Ownership of Planner]] feature and is not part of this implementation.*

**Desktop View:**
- Tags displayed within the expanded planner accordion/card
- Grid layout: 2-3 columns of tag cards
- Each card shows: colored badge preview, editable name input, color selector, delete action, drag handle
- "+ New Tag" button at the top of the tags section

**Mobile View:**
- Single column stack of tag cards within the expanded planner section
- Larger touch targets for actions
- Full-width inputs for easy editing
- Drag handles adapted for touch (larger hit area)

### Visual Design

**Tag Card Component:**
- **Background**: White (`#FFFFFF`) with subtle border (`#E0E0E0`)
- **Shadow**: Minimal (`shadow-sm`) for subtle depth
- **Border radius**: `md` (consistent with app)
- **Padding**: `md` (16px)
- **Layout**: Horizontal flex with drag handle on left

**Drag Handle:**
- Icon: `IconGripVertical` from Tabler icons
- Positioned at far left of tag card
- Color: `gray.5` default, `forest` on hover
- Size: 20px with 44x44px touch target on mobile
- Cursor: `grab` (changes to `grabbing` during drag)
- Accessibility: `aria-label="Drag to reorder"`

**Tag Preview Badge:**
- Uses the existing `Tag` component with the 10-color palette
- Positioned after drag handle
- Serves as visual confirmation of the selected color

**Color Selector:**
- Horizontal row of 10 color swatches
- Each swatch is circular (`borderRadius: '50%'`)
- Size: 28px diameter with 4px gap
- Selected state: 2px forest green border (`#44633F`)
- Hover state: Scale to 1.1x with transition

**Name Input:**
- Inline editing using Mantine `TextInput`
- Save on blur or Enter key
- Cancel on Escape key
- Loading state during save
- Validation: Required, max 50 chars

**Delete Action:**
- Icon button (trash icon) with tooltip
- Confirmation modal before deletion
- Warning if tag is in use (shows usage count)
- Disabled while tag is being edited

**Create New Tag:**
- Prominent "+ New Tag" button at top of list
- Ember color (`#FF6542`) for CTA
- Opens inline form or modal with name + color selection

### User Flow

**Editing a Tag:**
1. User clicks on tag name (or pencil icon)
2. Name becomes editable TextInput with current value
3. User types new name
4. User presses Enter or clicks outside
5. Changes save automatically with loading indicator
6. Success: subtle checkmark animation
7. Error: inline error message below input

**Changing Tag Color:**
1. User clicks desired color swatch
2. Selection updates immediately (optimistic UI)
3. API call saves change in background
4. Tag preview badge updates to reflect new color
5. All instances of this tag in recipes update on next page load

**Deleting a Tag:**
1. User clicks trash icon
2. System checks if tag is used in any recipes/bookmarks
3. **If tag is NOT used**: Tag is deleted immediately with fade-out animation
4. **If tag IS used**: Confirmation modal appears with warning message showing usage count
5. User confirms deletion
6. Tag removed from list with fade-out animation
7. Tag removed from all recipes/bookmarks automatically

**Creating a Tag:**
1. User clicks "+ New Tag" button
2. Inline form appears at top of list (or modal on mobile)
3. Form has: name input (required), color selector (pre-selected based on cycle)
4. Color cycles through the 10-color palette sequentially (tangerine → rosewood → honey → ...)
5. User fills form and clicks "Create"
6. New tag appears at top of list with success animation
7. Form resets for additional tag creation with next color in cycle

**Reordering Tags:**
1. User drags tag card by the drag handle (grip icon on left side)
2. Visual feedback: card lifts slightly, drop zone highlighted
3. User drops tag in new position
4. Tags reorder immediately (optimistic UI)
5. New order saves automatically in background
6. Error handling: revert to previous order if save fails

### Component Structure

```
PlannerSettingsPage
└── PlannerList (server component)
    └── PlannerItem (server component - checks permissions)
        └── PlannerDetails (client component - expandable)
            ├── SharedUsersSection (future: Shared Planners story)
            └── TagManagementSection (if owner/admin)
                ├── TagListHeader
                │   └── CreateTagForm
                ├── SortableTagList (client component with dnd-kit)
                │   └── SortableTagCard (client component)
                │       ├── DragHandle (grip icon)
                │       ├── TagBadge (display)
                │       ├── TagNameEditor (inline editing)
                │       ├── ColorSelector (swatch row)
                │       └── DeleteTagButton
                └── DeleteConfirmationModal (conditional)
```

**Permission Check:**
- PlannerItem receives user's role for the planner (owner/admin/read/write)
- Tag management section only renders if role is 'owner' or 'admin'
- Read/write users see a collapsed or disabled state with message: "Tag management requires owner or admin privileges"

### Accessibility

**Keyboard Navigation:**
- Full keyboard access to all interactive elements
- Tab order: Drag handle → Name edit → Color swatches → Delete → Next tag
- Enter to activate edit mode or confirm actions
- Escape to cancel editing
- Arrow keys navigate color swatches when focused
- **Reorder via keyboard**: Space/Enter to lift tag, Arrow keys to move, Space/Enter to drop

**Screen Readers:**
- Each tag card has `aria-label` with format "Tag: {name}, color: {colorName}"
- Color swatches have `aria-label` with color name
- Delete button announces "Delete tag {name}"
- Live region for save confirmations
- Error messages associated with inputs via `aria-describedby`

**Focus Management:**
- Focus returns to edit button after saving/canceling name edit
- Focus moves to first color swatch when color selector activated
- Focus trap in delete confirmation modal
- Focus moves to "+ New Tag" button after creating a tag

### Responsive Behavior

**Desktop (>768px):**
- Grid layout: 2-3 columns depending on container width
- Color selector always visible (not collapsed)
- Inline editing with compact layout

**Tablet (480px-768px):**
- 2-column grid
- Slightly reduced padding
- Same interactions as desktop

**Mobile (<480px):**
- Single column stack
- Full-width inputs during editing
- Color selector may wrap to 2 rows
- Delete confirmation uses full-screen modal on very small screens
- Touch targets minimum 44x44px

### Error Handling

**Validation Errors:**
- Empty name: "Tag name is required"
- Duplicate name: "A tag with this name already exists"
- Name too long: "Tag name must be 50 characters or less"

**Server Errors:**
- Inline error message below affected field
- Non-blocking: user can retry
- Toast notification for critical failures

**Network Errors:**
- Retry button on failed operations
- Optimistic UI rolls back on failure

### Loading States

- Skeleton cards while loading initial tag list
- Spinner in save button during name edit
- Disabled state on color swatches during color change
- Loading overlay on tag card during deletion

### Animations

- Subtle fade-in for new tags (0.2s ease-out)
- Scale 1.05x on color swatch hover
- Slide-out animation on tag deletion
- Smooth border color transition on selection changes

---

## Technical Considerations

### Server Actions Needed
1. `getTags(plannerId)` - Fetch all tags with usage counts
2. `updateTagName(plannerId, tagId, name)` - Rename tag
3. `updateTagColor(plannerId, tagId, color)` - Change color
4. `deleteTag(plannerId, tagId)` - Remove tag (cascades to recipes)
5. `createTag(plannerId, name, color)` - Create new tag
6. `reorderTags(plannerId, tagIds)` - Update tag order

### Permissions
- All tag management actions require owner or admin role
- Server actions must verify permissions before executing
- Returns `{ ok: false, error: 'Unauthorized' }` for insufficient permissions

### Database Considerations
- Tag deletion must update all recipes/bookmarks that reference the tag
- Consider soft delete vs hard delete (hard delete preferred for simplicity)
- Usage count query: count recipes/bookmarks with tag in their tags array
- Tag order stored as array index in `planner.tags` array
- Reordering updates the entire tags array order

### Performance
- Debounce name edits (300ms) to reduce API calls
- Optimistic UI updates for immediate feedback
- Revalidate tags on mutation (Next.js cache)

---

## Related Files

- `src/_models/planner/tag.types.ts` - Tag schema
- `src/_theme/colors.ts` - Tag color palette
- `src/_components/Tag/Tag.tsx` - Tag display component
- `src/_components/TagCombobox.tsx` - Existing tag selection UI
- `src/app/settings/page.tsx` - Settings page layout
- `src/app/settings/_components/PlannerList.tsx` - Current planner settings

---

## Open Questions - RESOLVED

1. **✅ RESOLVED**: Show confirmation dialog only if tag is in use. If not used, delete immediately without confirmation.
2. **✅ RESOLVED**: No preview of recipes needed.
3. **✅ RESOLVED**: New tags cycle through the 10-color palette sequentially.
4. **✅ RESOLVED**: Support tag reordering via drag-and-drop (and keyboard).

---

## References

- Mantine Components: Card, TextInput, Group, Stack, Badge, ColorSwatch, Modal, Button, ActionIcon, Tooltip, Accordion (for expandable planner sections)
- Drag and Drop: `@dnd-kit/core` and `@dnd-kit/sortable` for reordering
- Theme: Follow Weeknight theme colors (forest green for interactions, ember for CTAs)
- Pattern: Similar inline editing pattern as InlineTagsEditor in recipe details
- Icons: Tabler Icons (`IconGripVertical` for drag handle, `IconTrash` for delete)
