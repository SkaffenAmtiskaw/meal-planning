# Naming Conventions
- To align with JS/TS project conventions, use camelCase or UpperCamelCase (for React components) for file names.

# Barrels Files
- Barrel files should NEVER have logic.

# Unit Tests
- Reusable mocks should be placed in `test/mocks` - mock files should NEVER be in `src/`

# Generic vs Domain-Specific Utilities
- `src/_utils` should contain generic utilities which have no domain-knowledge. Naming conventions should be generic, and indicate what they do rather than suggesting a domain-specific purpose.
- Utilities which have domain-knowledge should exist in `_utils` directories in the directories where they are consumed. If they are consumed in multiple places, the `_utils` directory should be placed in the lowest common parent directory of all consuming modules.