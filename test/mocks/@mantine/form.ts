/**
 * Shared mock for @mantine/form.
 *
 * Usage in a test file:
 *
 *   import { mockUseForm } from '@mocks/@mantine/form';
 *   vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));
 *
 * `mockUseForm` has no default implementation — set one up in beforeEach:
 *
 *   beforeEach(() => {
 *     mockUseForm.mockReturnValue({
 *       onSubmit: (handler) => (e) => { e.preventDefault(); handler({ ...formValues }); },
 *       getInputProps: () => ({}),
 *       key: (field) => field,
 *     });
 *   });
 *
 * Use `mockUseForm.mockReturnValueOnce(...)` to override for a single test.
 */

import { vi } from 'vitest';

export const mockUseForm = vi.fn();

export const schemaResolver = vi.fn(() => () => ({}));

export const useForm = () => mockUseForm();