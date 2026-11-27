import { vi } from 'vitest';

import type { ReactNode } from 'react';

// ─── Shared mock implementations ────────────────────────────────────────────────

export const useForm = vi.fn(
	(options?: {
		initialValues?: Record<string, unknown>;
		onValuesChange?: (
			values: Record<string, unknown>,
			previousValues: Record<string, unknown>,
		) => void;
	}) => {
		const values = { ...(options?.initialValues ?? {}) };

		return {
			values,
			errors: {} as Record<string, ReactNode>,
			onSubmit:
				(handler: (values: Record<string, unknown>) => void) =>
				(event: { preventDefault: () => void }) => {
					event.preventDefault();
					handler(values);
				},
			getInputProps: vi.fn((field: string) => ({
				value: values[field] ?? '',
				onChange: (event: { target: { value: unknown } }) => {
					const previousValues = { ...values };
					values[field] = event.target.value;
					options?.onValuesChange?.(values, previousValues);
				},
			})),
			key: vi.fn((field: string) => field),
			setFieldValue: vi.fn(),
			insertListItem: vi.fn(),
			removeListItem: vi.fn(),
			isDirty: vi.fn(() => false),
		};
	},
);

export const schemaResolver = vi.fn(() => () => ({}));

/**
 * The provider only renders its children, and the context hook gives a form
 * from useForm. A test sets the form it needs with
 *   vi.mocked(useMealFormContext).mockReturnValue(...)
 */
export const createFormContext = vi.fn(() => [
	vi.fn(({ children }: { children: ReactNode }) => children),
	vi.fn(() => useForm()),
	useForm,
]);
