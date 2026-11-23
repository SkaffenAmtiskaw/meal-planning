/**
 * Shared mock for @mantine/dates.
 *
 * Usage in a test file:
 *
 *   vi.mock('@mantine/dates', async () => await import('#mocks/@mantine/dates'))
 *
 * `DatePicker` is a date input, so a test picks a day with
 * `fireEvent.change(screen.getByTestId('date-picker'), { target: { value: '2024-07-20' } })`.
 */

import { vi } from 'vitest';

export const DatePicker = vi.fn(
	({
		value,
		onChange,
	}: {
		value?: string | null;
		onChange?: (value: string | null) => void;
	}) => (
		<input
			type="date"
			data-testid="date-picker"
			value={value ?? ''}
			onChange={(event) => onChange?.(event.target.value || null)}
		/>
	),
);
