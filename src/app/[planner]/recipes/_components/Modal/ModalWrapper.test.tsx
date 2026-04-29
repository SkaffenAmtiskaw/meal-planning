import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { ModalWrapper } from './ModalWrapper';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/jafar-planner/recipes',
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('modal wrapper', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('navigates to current pathname when closed', () => {
		render(<ModalWrapper opened />);

		fireEvent.click(screen.getByRole('button', { name: /close/i }));

		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});

	test('calls the provided onClose callback and then navigates when closed', () => {
		const onClose = vi.fn();
		render(<ModalWrapper opened onClose={onClose} />);

		fireEvent.click(screen.getByRole('button', { name: /close/i }));

		expect(onClose).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});
});
