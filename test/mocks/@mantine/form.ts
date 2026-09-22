import { vi } from 'vitest';

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
		};
	},
);

export const schemaResolver = vi.fn(() => () => ({}));
