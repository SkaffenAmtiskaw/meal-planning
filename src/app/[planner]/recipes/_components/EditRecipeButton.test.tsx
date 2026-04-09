import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { EditRecipeButton } from './EditRecipeButton';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('EditRecipeButton', () => {
	test('navigates to href when clicked', () => {
		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		fireEvent.click(screen.getByTestId('edit-button'));
		expect(mockPush).toHaveBeenCalledWith('?item=123&status=edit&type=recipe');
	});
});
