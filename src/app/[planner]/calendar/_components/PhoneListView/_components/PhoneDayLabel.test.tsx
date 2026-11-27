import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { PhoneDayLabel } from './PhoneDayLabel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const date = DateTime.local(2026, 11, 21);

describe('PhoneDayLabel', () => {
	it("rings today's label and spells out that it's today", () => {
		render(<PhoneDayLabel date={date} isToday />);

		const badge = screen.getByTestId('phone-day-today');
		expect(badge.getAttribute('data-variant')).toBe('ring');
		expect(badge.textContent).toBe('Today, Sat 21 Nov');
	});

	it('shows any other day without the ring', () => {
		render(<PhoneDayLabel date={date} isToday={false} />);

		expect(screen.queryByTestId('phone-day-today')).toBeNull();
		expect(screen.getByTestId('phone-day-label').textContent).toBe(
			'Sat 21 Nov',
		);
	});
});
