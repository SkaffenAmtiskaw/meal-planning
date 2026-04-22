import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AddItemDropdown } from './AddItemDropdown';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/jafar-planner/recipes',
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const { mockUseCanWrite } = vi.hoisted(() => ({ mockUseCanWrite: vi.fn() }));
vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: () => mockUseCanWrite(),
}));

describe('add item dropdown', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
	});

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

	test('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);

		render(<AddItemDropdown />);

		expect(screen.queryByTestId('add-bookmark')).toBeNull();
		expect(screen.queryByTestId('add-recipe')).toBeNull();
	});

	test('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);

		render(<AddItemDropdown />);

		expect(screen.getByTestId('add-bookmark')).not.toBeNull();
		expect(screen.getByTestId('add-recipe')).not.toBeNull();
	});
});
