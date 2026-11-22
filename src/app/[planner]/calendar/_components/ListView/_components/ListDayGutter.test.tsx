import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { ListDayGutter } from './ListDayGutter';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('ListDayGutter', () => {
	it('renders the weekday label in capitals', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		expect(screen.getByText('SAT')).toBeDefined();
	});

	it('does not mark another day as the current date', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		expect(screen.getByText('15').getAttribute('aria-current')).toBeNull();
	});

	it('marks today as the current date', () => {
		render(<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday />);

		expect(screen.getByText('15').getAttribute('aria-current')).toBe('date');
	});

	it('shows the month abbreviation on the first of the month', () => {
		render(<ListDayGutter date={DateTime.local(2024, 6, 1)} isToday={false} />);

		expect(screen.getByText('JUN')).toBeDefined();
	});

	it('does not show the month abbreviation on other days', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		expect(screen.queryByText('JUN')).toBeNull();
	});

	it('renders the add meal button it is given', () => {
		render(
			<ListDayGutter
				date={DateTime.local(2024, 6, 15)}
				isToday={false}
				addMealButton={<button type="button">Add</button>}
			/>,
		);

		expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
	});
});
