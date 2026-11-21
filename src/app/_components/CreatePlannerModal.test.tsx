import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRouter } from 'next/navigation';

import { CreatePlannerForm } from './CreatePlannerForm';
import { CreatePlannerModal } from './CreatePlannerModal';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('./CreatePlannerForm', () => ({
	CreatePlannerForm: vi.fn(() => null),
}));

describe('CreatePlannerModal', () => {
	const mockOnClose = vi.fn();
	const mockRefresh = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const formProps = () => vi.mocked(CreatePlannerForm).mock.calls[0][0];

	it('closes without refreshing after a cancel', () => {
		render(<CreatePlannerModal opened={true} onClose={mockOnClose} />);

		formProps().onCancel();

		expect(mockOnClose).toHaveBeenCalled();
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('closes and refreshes the page after a save', () => {
		render(<CreatePlannerModal opened={true} onClose={mockOnClose} />);

		formProps().onSuccess();

		expect(mockOnClose).toHaveBeenCalled();
		expect(mockRefresh).toHaveBeenCalled();
	});
});
