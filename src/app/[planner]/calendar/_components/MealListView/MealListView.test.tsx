import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { MealListView } from './MealListView';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ListView/ListView', async () => ({
	ListView: vi.fn(() => <div data-testid="list-view" />),
}));

const mockUseIsMobile = vi.mocked(useIsMobile);

const plannerId = 'planner-123';

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseIsMobile.mockReturnValue(false);
	});

	it('renders MobileListViewPlaceholder on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByText('Coming soon')).toBeDefined();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView on desktop', () => {
		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByText('Coming soon')).toBeNull();
	});
});
