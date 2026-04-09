import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { AddItemDropdown } from './AddItemDropdown';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/jafar-planner/recipes',
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('add item dropdown', () => {
	test('clicking bookmark navigates to the add bookmark URL', () => {
		render(<AddItemDropdown />);

		fireEvent.click(screen.getByTestId('add-bookmark'));

		expect(mockPush).toHaveBeenCalledWith(
			'/jafar-planner/recipes?status=add&type=bookmark',
		);
	});

	test('clicking recipe navigates to the add recipe URL', () => {
		render(<AddItemDropdown />);

		fireEvent.click(screen.getByTestId('add-recipe'));

		expect(mockPush).toHaveBeenCalledWith(
			'/jafar-planner/recipes?status=add&type=recipe',
		);
	});
});
