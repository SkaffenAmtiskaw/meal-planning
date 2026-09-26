import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BurgerToggle } from './BurgerToggle';
import { useToggleContext } from './ToggleContext';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./ToggleContext', () => ({
	useToggleContext: vi.fn(),
}));

describe('BurgerToggle', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should call toggle function when Burger is clicked', () => {
		const mockToggle = vi.fn();
		vi.mocked(useToggleContext).mockReturnValue({
			opened: false,
			toggle: mockToggle,
		});

		render(<BurgerToggle color="white" />);

		fireEvent.click(screen.getByRole('button'));

		expect(mockToggle).toHaveBeenCalledTimes(1);
	});
});
