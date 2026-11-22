import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DatePicker } from '@mantine/dates';

import { DatePickerGrid } from './DatePickerGrid';

vi.mock('@mantine/dates', async () => await import('#mocks/@mantine/dates'));

describe('DatePickerGrid', () => {
	it("opens on the value's month", () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(vi.mocked(DatePicker)).toHaveBeenCalledWith(
			expect.objectContaining({ defaultDate: '2024-06-15' }),
			undefined,
		);
	});

	it("leaves the month it opens on to Mantine, which shows today's, when there's no value", () => {
		render(<DatePickerGrid value={null} onChange={vi.fn()} />);

		expect(vi.mocked(DatePicker)).toHaveBeenCalledWith(
			expect.objectContaining({ defaultDate: undefined }),
			undefined,
		);
	});

	it('labels each weekday with a single letter', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		const { weekdayFormat } = vi.mocked(DatePicker).mock.lastCall?.[0] as {
			weekdayFormat: (date: string) => string;
		};

		expect(weekdayFormat('2026-11-22')).toBe('S');
		expect(weekdayFormat('2026-11-25')).toBe('W');
	});

	it('reports the picked date', () => {
		const onChange = vi.fn();
		render(<DatePickerGrid value="2024-06-15" onChange={onChange} />);

		fireEvent.change(screen.getByTestId('date-picker'), {
			target: { value: '2024-07-20' },
		});

		expect(onChange).toHaveBeenCalledWith('2024-07-20');
	});

	it('reports nothing when Mantine clears the value', () => {
		const onChange = vi.fn();
		render(<DatePickerGrid value="2024-06-15" onChange={onChange} />);

		fireEvent.change(screen.getByTestId('date-picker'), {
			target: { value: '' },
		});

		expect(onChange).not.toHaveBeenCalled();
	});
});
