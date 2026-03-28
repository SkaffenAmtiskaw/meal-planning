import { useSelectedLayoutSegment } from 'next/navigation';

import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { Navbar } from './Navbar';

vi.mock('next/navigation', () => ({
	useSelectedLayoutSegment: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('navbar', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders calendar and recipes links', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);

		render(<Navbar id="gaston-planner-1" />, { wrapper });

		expect(screen.getByText('Calendar')).toBeDefined();
		expect(screen.getByText('Recipes')).toBeDefined();
	});

	test('links point to correct paths using the given planner id', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);

		render(<Navbar id="gaston-planner-1" />, { wrapper });

		expect(
			screen.getByRole('link', { name: /calendar/i }).getAttribute('href'),
		).toBe('/gaston-planner-1/calendar');
		expect(
			screen.getByRole('link', { name: /recipes/i }).getAttribute('href'),
		).toBe('/gaston-planner-1/recipes');
	});

	test('calendar link is active when on the calendar segment', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue('calendar');

		render(<Navbar id="gaston-planner-1" />, { wrapper });

		expect(
			screen
				.getByRole('link', { name: /calendar/i })
				.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByRole('link', { name: /recipes/i })
				.getAttribute('data-active'),
		).toBeFalsy();
	});

	test('recipes link is active when on the recipes segment', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue('recipes');

		render(<Navbar id="gaston-planner-1" />, { wrapper });

		expect(
			screen
				.getByRole('link', { name: /recipes/i })
				.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByRole('link', { name: /calendar/i })
				.getAttribute('data-active'),
		).toBeFalsy();
	});
});
