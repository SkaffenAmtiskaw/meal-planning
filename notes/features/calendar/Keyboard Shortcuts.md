---
type: feature
status: spec
blocked-by:
  - "outdated - re-review against current calendar designs once the calendar views are mostly complete"
reviewed: 2026-04-29
---
# High-Level Overview

Implement global keyboard shortcuts for power users to efficiently navigate and interact with the calendar without relying on mouse/touch.

## User Value

- **Power users** can work significantly faster with keyboard-only navigation
- **Accessibility** - users with motor impairments who rely on keyboards
- **Productivity** - common actions (jump to today, create meal, switch views) become instant
- **Professional feel** - matches expectations from apps like Google Calendar, Outlook

## Proposed Keyboard Shortcuts

### Navigation Shortcuts
| Key | Action |
|-----|--------|
| `T` | Jump to today |
| `J` or `N` | Next period (next week/month/day depending on view) |
| `K` or `P` | Previous period |
| `G` | Go to specific date (opens date picker) |

### View Switching
| Key | Action |
|-----|--------|
| `1` or `M` | Month view |
| `2` or `W` | Week view |
| `3` or `L` | List view |

### Actions
| Key | Action |
|-----|--------|
| `C` | Create new meal (opens AddMeal modal) |
| `/` | Focus search input (when search is implemented in list view) |
| `?` | Show keyboard shortcuts help modal |
| `E` | Edit selected meal (when meal is focused) |
| `Delete` or `Backspace` | Delete selected meal (with confirmation) |

### Escape Hatch
| Key | Action |
|-----|--------|
| `Esc` | Close modals, exit event mode, clear selection |

## Implementation Notes

### Technical Approach
- Use a global keyboard event listener (custom hook: `useKeyboardShortcuts`)
- Only activate when user is not typing in an input field
- Show toast notification when shortcuts are triggered (optional)
- Persist user preference to disable shortcuts (accessibility)

### Accessibility Considerations
- Provide a way to disable shortcuts (some users may trigger them accidentally)
- Ensure shortcuts don't conflict with screen reader keys
- Document all shortcuts in a help modal (`?` key)
- Follow established conventions (match Google Calendar where possible)

### Keys the date picker already uses
*(Added 2026-09-25 while planning [[Unified Date Picker Component]], Steps 21-22, now [[Header Date Picker]] Steps 10-11.)* When the global shortcuts are built, check each one against the keys the shared date picker (`src/_components/CalendarDatePicker/`) handles while it's open or focused, so neither one takes the other's keys:
- Our code, in `useDatePickerKeys`: PgUp/PgDn (same day, previous or next month) and Home/End (start or end of the week)
- Mantine's `DatePicker`: arrows, Enter, Esc, Ctrl/Cmd+arrow (jump a year; Ctrl+Shift+arrow for a decade) and `Y` (open the year view)

Collisions already visible in the table above:
- `Esc` - "close modals" vs the picker closing itself. Pressing Esc in a picker inside the Add Meal modal should close only the picker.
- "Only activate when user is not typing in an input field" doesn't cover the picker's day grid, which is buttons, not an input. Letter and number shortcuts (`T`, `J`/`K`, `N`/`P`, `1`-`3`, `M`/`W`/`L`, `C`, `E`) would fire while a day is focused unless the picker is excluded as well.
- `G` opens the date picker, so check that the picker's own keys take over once it's open.
- Don't assign `Y` or Ctrl/Cmd+arrow to a global shortcut.

### Dependencies
- This should be implemented **after** the custom calendar is complete
- Depends on: [[Replace Schedule-X]]

## Acceptance Criteria

- [ ] All proposed shortcuts work from any calendar view
- [ ] Shortcuts don't trigger when typing in input fields
- [ ] Pressing `?` opens a help modal showing all available shortcuts
- [ ] User can disable shortcuts in settings (optional)
- [ ] Shortcuts are announced to screen readers
- [ ] Visual feedback when shortcuts are triggered (optional toast)
- [ ] No conflicts with browser or assistive technology shortcuts
- [ ] Works alongside existing Tier 1 keyboard navigation
