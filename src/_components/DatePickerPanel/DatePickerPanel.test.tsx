import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DatePickerPanel } from './DatePickerPanel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../DatePickerGrid', () => ({
	DatePickerGrid: vi.fn(() => null),
}));
vi.mock('./_components/TodayFooter/TodayFooter', () => ({
	TodayFooter: vi.fn(() => <div data-testid="today-footer" />),
}));

describe('DatePickerPanel', () => {
	it('shows the Today footer with withTodayFooter', () => {
		render(<DatePickerPanel value={null} onChange={vi.fn()} withTodayFooter />);

		expect(screen.queryByTestId('today-footer')).not.toBeNull();
	});

	it('leaves the Today footer out by default', () => {
		render(<DatePickerPanel value={null} onChange={vi.fn()} />);

		expect(screen.queryByTestId('today-footer')).toBeNull();
	});
});
