import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { AddItemDropdown } from './AddItemDropdown';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/jafar-planner/recipes',
}));

vi.mock('@mantine/core', () => {
	const Menu = ({ children }: { children: React.ReactNode }) => <>{children}</>;
	Menu.Target = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	Menu.Dropdown = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	Menu.Item = ({
		children,
		onClick,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		'data-testid'?: string;
	}) => (
		<button type="button" data-testid={testId} onClick={onClick}>
			{children}
		</button>
	);
	return {
		Menu,
		Button: ({ children }: { children: React.ReactNode }) => (
			<button type="button">{children}</button>
		),
	};
});

vi.mock('@tabler/icons-react', () => ({
	IconPlus: () => null,
	IconBookmark: () => null,
	IconBowlSpoon: () => null,
}));

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
