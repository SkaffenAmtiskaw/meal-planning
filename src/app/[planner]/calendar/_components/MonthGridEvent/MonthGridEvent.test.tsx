import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { MonthGridEvent } from './MonthGridEvent';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('MonthGridEvent', () => {
	test('renders the event title in a bold paragraph', () => {
		render(<MonthGridEvent calendarEvent={{ title: 'Breakfast' }} />);
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('renders description paragraph when description is present', () => {
		render(
			<MonthGridEvent
				calendarEvent={{ title: 'Breakfast', description: 'Eggs and toast' }}
			/>,
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
		expect(screen.getByText('Eggs and toast')).toBeDefined();
	});

	test('does not render description paragraph when description is absent', () => {
		render(<MonthGridEvent calendarEvent={{ title: 'Lunch' }} />);
		expect(screen.queryAllByRole('paragraph')).toHaveLength(1);
	});

	test('renders nothing extra for missing title', () => {
		render(<MonthGridEvent calendarEvent={{}} />);
		expect(screen.queryAllByRole('paragraph')).toHaveLength(1);
	});
});
