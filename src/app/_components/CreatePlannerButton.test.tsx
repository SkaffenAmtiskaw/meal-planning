import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDisclosure } from '@mantine/hooks';

import { CreatePlannerButton } from './CreatePlannerButton';
import { CreatePlannerModal } from './CreatePlannerModal';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('./CreatePlannerModal', () => ({
	CreatePlannerModal: vi.fn(() => null),
}));

describe('CreatePlannerButton', () => {
	const mockOpen = vi.fn();
	const mockClose = vi.fn();

	beforeAll(() => {
		vi.mocked(useDisclosure).mockImplementation(() => [
			false,
			{ open: mockOpen, close: mockClose, toggle: vi.fn(), set: vi.fn() },
		]);
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens the modal when the button is clicked', () => {
		render(<CreatePlannerButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Create Planner' }));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('calls close when CreatePlannerModal requests close', () => {
		render(<CreatePlannerButton />);

		const onClose = vi.mocked(CreatePlannerModal).mock.calls[0][0].onClose;

		onClose();

		expect(mockClose).toHaveBeenCalled();
	});
});
