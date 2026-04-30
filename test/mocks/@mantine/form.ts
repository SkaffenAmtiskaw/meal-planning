import { vi } from 'vitest';

// ─── Shared mock implementations ────────────────────────────────────────────────

export const useForm = vi.fn((options?: { initialValues?: Record<string, unknown> }) => {
	const values = options?.initialValues ?? {};

	return {
		onSubmit: (handler: (values: Record<string, unknown>) => void) =>
			(event: { preventDefault: () => void }) => {
				event.preventDefault();
				handler(values);
			},
		getInputProps: vi.fn(() => ({}) as Record<string, unknown>),
		key: vi.fn((field: string) => field),
	};
});

export const schemaResolver = vi.fn(() => () => ({}));
