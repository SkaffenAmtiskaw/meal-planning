import { MantineProvider } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { MonthGridEvent } from './MonthGridEvent';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('MonthGridEvent', () => {
	test('renders the event title in a bold paragraph', () => {
		render(<MonthGridEvent calendarEvent={{ title: 'Breakfast' }} />, {
			wrapper,
		});
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('renders description paragraph when description is present', () => {
		render(
			<MonthGridEvent
				calendarEvent={{ title: 'Breakfast', description: 'Eggs and toast' }}
			/>,
			{ wrapper },
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
		expect(screen.getByText('Eggs and toast')).toBeDefined();
	});

	test('does not render description paragraph when description is absent', () => {
		render(<MonthGridEvent calendarEvent={{ title: 'Lunch' }} />, { wrapper });
		expect(screen.queryAllByRole('paragraph')).toHaveLength(1);
	});

	test('renders nothing extra for missing title', () => {
		render(<MonthGridEvent calendarEvent={{}} />, { wrapper });
		expect(screen.queryAllByRole('paragraph')).toHaveLength(1);
	});
});
