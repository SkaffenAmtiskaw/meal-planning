import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BurgerToggle } from './BurgerToggle';
import { ToggleProvider } from './ToggleContext';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockUseDisclosure = vi.fn();
vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => mockUseDisclosure(),
}));

describe('BurgerToggle', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should render Burger with color prop', () => {
		mockUseDisclosure.mockReturnValue([false, { toggle: vi.fn() }]);

		render(
			<ToggleProvider>
				<BurgerToggle color="red" />
			</ToggleProvider>,
		);

		// Burger is rendered - we can verify by checking the button exists
		const burgerButton = document.querySelector('button');
		expect(burgerButton).toBeTruthy();
	});

	it('should call toggle function when Burger is clicked', () => {
		const mockToggle = vi.fn();
		mockUseDisclosure.mockReturnValue([false, { toggle: mockToggle }]);

		render(
			<ToggleProvider>
				<BurgerToggle color="white" />
			</ToggleProvider>,
		);

		const burgerButton = document.querySelector('button');
		burgerButton?.click();

		expect(mockToggle).toHaveBeenCalledTimes(1);
	});

	it('should throw error when used outside ToggleProvider', () => {
		expect(() => render(<BurgerToggle color="blue" />)).toThrow(
			'useToggleContext must be used within ToggleProvider',
		);
	});
});
