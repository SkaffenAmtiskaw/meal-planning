import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileListViewPlaceholder } from './MobileListViewPlaceholder';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('MobileListViewPlaceholder', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the coming soon message', () => {
		render(<MobileListViewPlaceholder />);

		expect(screen.getByText('Coming soon')).toBeDefined();
	});
});
