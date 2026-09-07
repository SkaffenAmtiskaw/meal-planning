import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListView } from './ListView';

import { CalendarProvider } from '../CalendarProvider';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('ListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('displays list view placeholder with selected date', () => {
		const initialDate = DateTime.local(2024, 6, 15);

		render(
			<CalendarProvider initialDate={initialDate}>
				<ListView />
			</CalendarProvider>,
		);

		expect(screen.getByText('List View – June 15, 2024')).toBeDefined();
	});
});
