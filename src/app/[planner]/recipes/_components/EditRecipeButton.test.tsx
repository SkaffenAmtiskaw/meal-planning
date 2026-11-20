import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { useRouter } from 'next/navigation';

import { useCanWrite } from '@/app/[planner]/_components';

import { EditRecipeButton } from './EditRecipeButton';

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

const mockPush = vi.fn();

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'@/app/[planner]/_components',
	async () => await import('#mocks/@/app/[planner]/_components'),
);

describe('EditRecipeButton', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useCanWrite).mockReturnValue(true);
	});

	test('navigates to href when clicked', () => {
		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		fireEvent.click(screen.getByTestId('edit-button'));
		expect(mockPush).toHaveBeenCalledWith('?item=123&status=edit&type=recipe');
	});

	test('does not render when user has read-only access', () => {
		vi.mocked(useCanWrite).mockReturnValue(false);

		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		expect(screen.queryByTestId('edit-button')).toBeNull();
	});

	test('renders when user has write access', () => {
		render(<EditRecipeButton href="?item=123&status=edit&type=recipe" />);
		expect(screen.getByTestId('edit-button')).toBeDefined();
	});
});
