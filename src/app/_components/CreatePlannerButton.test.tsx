import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDisclosure } from '@mantine/hooks';

import { CreatePlannerButton } from './CreatePlannerButton';
import { CreatePlannerForm } from './CreatePlannerForm';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('./CreatePlannerForm', () => ({
	CreatePlannerForm: vi.fn(() => <div data-testid="create-planner-form" />),
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

	it('opens the form when the button is clicked', () => {
		render(<CreatePlannerButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Create Planner' }));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('calls close when CreatePlannerForm requests close', () => {
		render(<CreatePlannerButton />);

		const onClose = vi.mocked(CreatePlannerForm).mock.calls[0][0].onClose;

		onClose();

		expect(mockClose).toHaveBeenCalled();
	});
});
