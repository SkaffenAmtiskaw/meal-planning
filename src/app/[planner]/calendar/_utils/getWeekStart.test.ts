import 'temporal-polyfill/global';

import { describe, expect, test, vi } from 'vitest';

import { getWeekStart } from './getWeekStart';

vi.mock('temporal-polyfill/global', () => ({}));

describe('getWeekStart', () => {
	test('returns the same Sunday when given a Sunday string', () => {
		vi.stubGlobal('Temporal', {
			PlainDate: {
				from: vi.fn(() => ({
					dayOfWeek: 7,
					subtract: vi.fn((d) => ({ days: d.days })),
				})),
			},
			Now: { plainDateISO: vi.fn() },
		});
		const mockDate = { dayOfWeek: 7, subtract: vi.fn(() => 'sunday-result') };
		vi.mocked(Temporal.PlainDate.from).mockReturnValueOnce(mockDate as never);
		const result = getWeekStart('2024-01-14');
		expect(Temporal.PlainDate.from).toHaveBeenCalledWith('2024-01-14');
		expect(mockDate.subtract).toHaveBeenCalledWith({ days: 0 });
		expect(result).toBe('sunday-result');
	});

	test('returns the previous Sunday when given a Wednesday string', () => {
		vi.stubGlobal('Temporal', {
			PlainDate: { from: vi.fn() },
			Now: { plainDateISO: vi.fn() },
		});
		const mockDate = {
			dayOfWeek: 3,
			subtract: vi.fn(() => 'wednesday-result'),
		};
		vi.mocked(Temporal.PlainDate.from).mockReturnValueOnce(mockDate as never);
		const result = getWeekStart('2024-01-17');
		expect(mockDate.subtract).toHaveBeenCalledWith({ days: 3 });
		expect(result).toBe('wednesday-result');
	});

	test('falls back to today when dateStr is undefined', () => {
		const mockToday = { dayOfWeek: 1, subtract: vi.fn(() => 'today-result') };
		vi.stubGlobal('Temporal', {
			PlainDate: { from: vi.fn() },
			Now: { plainDateISO: vi.fn(() => mockToday) },
		});
		const result = getWeekStart(undefined);
		expect(Temporal.Now.plainDateISO).toHaveBeenCalled();
		expect(Temporal.PlainDate.from).not.toHaveBeenCalled();
		expect(result).toBe('today-result');
	});
});
