import { render } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { CalendarHeader } from './CalendarHeader';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockAddMealButton = vi.fn((_props: unknown) => null);
vi.mock('../AddMealButton/AddMealButton', () => ({
	AddMealButton: (props: unknown) => {
		mockAddMealButton(props);
		return null;
	},
}));

const mockViewSwitcher = vi.fn((_props: unknown) => null);
vi.mock('../ViewSwitcher/ViewSwitcher', () => ({
	ViewSwitcher: (props: unknown) => {
		mockViewSwitcher(props);
		return null;
	},
}));

const defaultProps = {
	plannerId: 'planner-1',
	onMealAdded: vi.fn(),
	viewType: 'month' as const,
	isMobile: false as boolean | undefined,
	onViewChange: vi.fn(),
};

describe('CalendarHeader', () => {
	test('passes plannerId and onMealAdded to AddMealButton', () => {
		render(<CalendarHeader {...defaultProps} />);
		expect(mockAddMealButton).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				onMealAdded: defaultProps.onMealAdded,
			}),
		);
	});

	test('passes viewType, isMobile, and onViewChange to ViewSwitcher', () => {
		render(<CalendarHeader {...defaultProps} />);
		expect(mockViewSwitcher).toHaveBeenCalledWith(
			expect.objectContaining({
				value: 'month',
				isMobile: false,
				onChange: defaultProps.onViewChange,
			}),
		);
	});
});
