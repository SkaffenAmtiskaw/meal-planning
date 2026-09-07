import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MonthGrid } from './MonthGrid';

import { CalendarProvider } from '../CalendarProvider';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('MonthGrid', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('displays month view placeholder with selected month and year', () => {
		const initialDate = DateTime.local(2024, 3, 15);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(screen.getByText('Month View – March 2024')).toBeDefined();
	});
});
