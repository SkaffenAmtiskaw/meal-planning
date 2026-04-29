import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccessLevelBadge } from './AccessLevelBadge';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('AccessLevelBadge', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders badge with access level text', () => {
		render(<AccessLevelBadge accessLevel="owner" />);

		expect(screen.getByTestId('access-level-badge')).toBeDefined();
		expect(screen.getByText('owner')).toBeDefined();
	});

	it('displays correct color for owner level', () => {
		render(<AccessLevelBadge accessLevel="owner" />);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('red');
	});

	it('displays correct color for admin level', () => {
		render(<AccessLevelBadge accessLevel="admin" />);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('orange');
	});

	it('displays correct color for write level', () => {
		render(<AccessLevelBadge accessLevel="write" />);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('blue');
	});

	it('displays correct color for read level', () => {
		render(<AccessLevelBadge accessLevel="read" />);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('gray');
	});
});
