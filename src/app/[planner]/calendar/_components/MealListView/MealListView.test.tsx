import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { MealListView } from './MealListView';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ListView/ListView', async () => ({
	ListView: vi.fn(() => <div data-testid="list-view" />),
}));

vi.mock('../PhoneListView/PhoneListView', async () => ({
	PhoneListView: vi.fn(() => <div data-testid="phone-list-view" />),
}));

const mockUseIsMobile = vi.mocked(useIsMobile);

const plannerId = 'planner-123';

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseIsMobile.mockReturnValue(false);
	});

	it('renders the phone list on a phone', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('phone-list-view')).toBeDefined();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders the desktop list above the phone breakpoint', () => {
		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByTestId('phone-list-view')).toBeNull();
	});
});
