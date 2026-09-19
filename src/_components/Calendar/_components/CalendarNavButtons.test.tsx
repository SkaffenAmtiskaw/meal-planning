import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CalendarNextButton,
	CalendarPreviousButton,
	CalendarTodayButton,
} from './CalendarNavButtons';

import { useCalendarContext } from '../CalendarContext';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

const mockGoToToday = vi.fn();
const mockGoToPrevious = vi.fn();
const mockGoToNext = vi.fn();

function setupCalendarContext() {
	vi.mocked(useCalendarContext).mockReturnValue({
		goToToday: mockGoToToday,
		goToPrevious: mockGoToPrevious,
		goToNext: mockGoToNext,
	} as unknown as ReturnType<typeof useCalendarContext>);
}

describe('CalendarTodayButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		setupCalendarContext();
	});

	it('renders a Today button', () => {
		render(<CalendarTodayButton />);

		expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
	});

	it('calls goToToday when clicked', () => {
		render(<CalendarTodayButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Today' }));

		expect(mockGoToToday).toHaveBeenCalled();
	});

	it('spreads extra props onto the button', () => {
		render(<CalendarTodayButton data-testid="today-button" />);

		expect(screen.getByTestId('today-button')).toBeDefined();
	});
});

describe('CalendarPreviousButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		setupCalendarContext();
	});

	it('renders a Previous button', () => {
		render(<CalendarPreviousButton />);

		expect(screen.getByRole('button', { name: 'Previous' })).toBeDefined();
	});

	it('calls goToPrevious when clicked', () => {
		render(<CalendarPreviousButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

		expect(mockGoToPrevious).toHaveBeenCalled();
	});
});

describe('CalendarNextButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		setupCalendarContext();
	});

	it('renders a Next button', () => {
		render(<CalendarNextButton />);

		expect(screen.getByRole('button', { name: 'Next' })).toBeDefined();
	});

	it('calls goToNext when clicked', () => {
		render(<CalendarNextButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Next' }));

		expect(mockGoToNext).toHaveBeenCalled();
	});
});
