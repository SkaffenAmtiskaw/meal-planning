import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MealDateSubtitle } from './MealDateSubtitle';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('MealDateSubtitle', () => {
	it('shows the date in the long style', () => {
		render(<MealDateSubtitle date="2026-11-27" />);

		expect(screen.getByTestId('modal-subtitle').textContent).toBe(
			'Friday, November 27',
		);
	});

	it('keeps an empty line while the meal has no date', () => {
		render(<MealDateSubtitle date="" />);

		expect(screen.getByTestId('modal-subtitle').textContent).toBe(' ');
	});
});
