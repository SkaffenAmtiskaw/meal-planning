import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { ListDayGutter } from './ListDayGutter';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'@/_components',
	async () => await import('#mocks/@/_components/NumberMark'),
);

describe('ListDayGutter', () => {
	it('shows the weekday', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		expect(screen.getByText('Sat')).toBeDefined();
	});

	it('neither rings nor marks another day as the current date', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		const mark = screen.getByTestId('number-mark-15');
		expect(mark.getAttribute('data-ring')).toBe('false');
		expect(mark.getAttribute('aria-current')).toBeNull();
	});

	it('rings today and marks it as the current date', () => {
		render(<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday />);

		const mark = screen.getByTestId('number-mark-15');
		expect(mark.getAttribute('data-ring')).toBe('true');
		expect(mark.getAttribute('aria-current')).toBe('date');
	});

	it('never fills the number', () => {
		render(<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday />);

		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-filled'),
		).toBe('false');
	});

	it('shows the month abbreviation on the first of the month', () => {
		render(<ListDayGutter date={DateTime.local(2024, 6, 1)} isToday={false} />);

		expect(screen.getByText('Jun')).toBeDefined();
	});

	it('does not show the month abbreviation on other days', () => {
		render(
			<ListDayGutter date={DateTime.local(2024, 6, 15)} isToday={false} />,
		);

		expect(screen.queryByText('Jun')).toBeNull();
	});
});
