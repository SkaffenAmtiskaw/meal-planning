import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { ViewSwitcher } from './ViewSwitcher';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('ViewSwitcher', () => {
	test('shows Month, Week, and List on desktop', () => {
		render(<ViewSwitcher isMobile={false} value="month" onChange={vi.fn()} />);
		expect(screen.getByText('Month')).toBeDefined();
		expect(screen.getByText('Week')).toBeDefined();
		expect(screen.getByText('List')).toBeDefined();
	});

	test('hides Week on mobile', () => {
		render(<ViewSwitcher isMobile={true} value="month" onChange={vi.fn()} />);
		expect(screen.getByText('Month')).toBeDefined();
		expect(screen.queryByText('Week')).toBeNull();
		expect(screen.getByText('List')).toBeDefined();
	});

	test('calls onChange with the selected view value', () => {
		const onChange = vi.fn();
		render(<ViewSwitcher isMobile={false} value="month" onChange={onChange} />);
		fireEvent.click(screen.getByText('Week'));
		expect(onChange).toHaveBeenCalledWith('week');
	});
});
