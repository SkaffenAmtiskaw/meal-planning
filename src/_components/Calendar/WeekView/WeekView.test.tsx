import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeekView } from './WeekView';

import { CalendarProvider } from '../CalendarProvider';
import { formatWeekRange } from '../_utils/formatWeekRange';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('WeekView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('displays week view placeholder with week range', () => {
		const initialDate = DateTime.local(2024, 6, 12);

		render(
			<CalendarProvider initialDate={initialDate}>
				<WeekView />
			</CalendarProvider>,
		);

		expect(
			screen.getByText(`Week View – ${formatWeekRange(initialDate)}`),
		).toBeDefined();
	});

	it('includes the year on both sides when the week spans two years', () => {
		const initialDate = DateTime.local(2024, 12, 31);

		render(
			<CalendarProvider initialDate={initialDate}>
				<WeekView />
			</CalendarProvider>,
		);

		expect(
			screen.getByText(`Week View – ${formatWeekRange(initialDate)}`),
		).toBeDefined();
	});
});
