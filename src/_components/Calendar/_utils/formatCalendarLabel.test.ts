import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

import {
	DEFAULT_VIEWS,
	LABEL_FORMATTERS,
	VIEW_LABELS,
} from './formatCalendarLabel';
import { formatWeekRange } from './formatWeekRange';

vi.mock('./formatWeekRange', () => ({
	formatWeekRange: vi.fn(),
}));

describe('formatCalendarLabel', () => {
	it('maps view types to labels', () => {
		expect(VIEW_LABELS).toEqual({
			list: 'List',
			month: 'Month',
			week: 'Week',
		});
	});

	it('provides default views', () => {
		expect(DEFAULT_VIEWS).toEqual(['month', 'week', 'list']);
	});

	it('formats month label', () => {
		const date = DateTime.local(2024, 6, 15);

		expect(LABEL_FORMATTERS.month(date)).toBe('June 2024');
	});

	it('formats list label like month', () => {
		const date = DateTime.local(2024, 6, 15);

		expect(LABEL_FORMATTERS.list(date)).toBe('June 2024');
	});

	it('formats week label using formatWeekRange', () => {
		const date = DateTime.local(2024, 6, 15);
		const label = 'Jun 10 – Jun 16, 2024';

		vi.mocked(formatWeekRange).mockReturnValue(label);

		expect(LABEL_FORMATTERS.week(date)).toBe(label);
		expect(formatWeekRange).toHaveBeenCalledWith(date);
	});
});
