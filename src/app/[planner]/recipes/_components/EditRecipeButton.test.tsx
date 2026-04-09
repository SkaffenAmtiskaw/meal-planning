import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { EditRecipeButton } from './EditRecipeButton';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconPencil: () => <svg data-testid="icon-pencil" />,
}));

describe('EditRecipeButton', () => {
	test('renders the pencil icon', () => {
		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		expect(screen.getByTestId('icon-pencil')).toBeDefined();
	});

	test('navigates to href when clicked', () => {
		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		fireEvent.click(screen.getByTestId('edit-button'));
		expect(mockPush).toHaveBeenCalledWith('?item=123&status=edit&type=recipe');
	});
});
