import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { WeekViewHeader } from './WeekViewHeader';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockViewSwitcher = vi.fn((_props: unknown) => null);
vi.mock('../ViewSwitcher/ViewSwitcher', () => ({
	ViewSwitcher: (props: unknown) => {
		mockViewSwitcher(props);
		return <div data-testid="view-switcher" />;
	},
}));

const defaultProps = {
	onPrev: vi.fn(),
	onNext: vi.fn(),
	onToday: vi.fn(),
	viewType: 'week' as const,
	isMobile: false as boolean | undefined,
	onViewChange: vi.fn(),
};

describe('WeekViewHeader', () => {
	test('renders prev, today, and next navigation buttons', () => {
		render(<WeekViewHeader {...defaultProps} />);
		expect(screen.getByTestId('week-prev')).toBeDefined();
		expect(screen.getByTestId('week-today')).toBeDefined();
		expect(screen.getByTestId('week-next')).toBeDefined();
	});

	test('calls onPrev when prev button is clicked', () => {
		const onPrev = vi.fn();
		render(<WeekViewHeader {...defaultProps} onPrev={onPrev} />);
		fireEvent.click(screen.getByTestId('week-prev'));
		expect(onPrev).toHaveBeenCalled();
	});

	test('calls onNext when next button is clicked', () => {
		const onNext = vi.fn();
		render(<WeekViewHeader {...defaultProps} onNext={onNext} />);
		fireEvent.click(screen.getByTestId('week-next'));
		expect(onNext).toHaveBeenCalled();
	});

	test('calls onToday when today button is clicked', () => {
		const onToday = vi.fn();
		render(<WeekViewHeader {...defaultProps} onToday={onToday} />);
		fireEvent.click(screen.getByTestId('week-today'));
		expect(onToday).toHaveBeenCalled();
	});

	test('passes viewType, isMobile, and onViewChange to ViewSwitcher', () => {
		render(<WeekViewHeader {...defaultProps} />);
		expect(mockViewSwitcher).toHaveBeenCalledWith(
			expect.objectContaining({
				value: 'week',
				isMobile: false,
				onChange: defaultProps.onViewChange,
			}),
		);
	});
});
