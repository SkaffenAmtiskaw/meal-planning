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
