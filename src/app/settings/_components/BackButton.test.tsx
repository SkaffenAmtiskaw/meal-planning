import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { BackButton } from './BackButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

describe('BackButton', () => {
	test('renders with correct href', () => {
		render(<BackButton href="/abc123/calendar" />);
		const link = screen.getByTestId('back-button');
		expect(link.getAttribute('href')).toBe('/abc123/calendar');
	});

	test('renders arrow left icon', () => {
		render(<BackButton href="/abc123/calendar" />);
		expect(screen.getByTestId('arrow-left-icon')).toBeDefined();
	});
});
