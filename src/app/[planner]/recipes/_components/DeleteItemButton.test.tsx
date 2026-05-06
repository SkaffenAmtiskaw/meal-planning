import { useRouter } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmButton } from '@/_components';

import { DeleteItemButton } from './DeleteItemButton';

const mockRefresh = vi.fn();

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockUseCanWrite = vi.fn();

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: () => mockUseCanWrite(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => <svg data-testid="icon-trash" />,
}));

vi.mock('@/_components', () => ({
	ConfirmButton: vi.fn(({ renderTrigger }) => renderTrigger?.(() => {})),
}));

const defaultProps = {
	onDelete: vi.fn(),
	title: 'Delete Item',
	message: 'Are you sure?',
};

describe('DeleteItemButton', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCanWrite.mockReturnValue(true);
	});

	it('passes onDelete as onConfirm to ConfirmButton', () => {
		render(<DeleteItemButton {...defaultProps} />);
		const call = vi.mocked(ConfirmButton).mock.calls[0][0];
		expect(call.onConfirm).toBe(defaultProps.onDelete);
		expect(call.title).toBe('Delete Item');
		expect(call.message).toBe('Are you sure?');
		expect(call.confirmButtonText).toBe('Delete');
	});

	it('passes a refresh callback as onSuccess', () => {
		render(<DeleteItemButton {...defaultProps} />);
		const call = vi.mocked(ConfirmButton).mock.calls[0][0];
		expect(call.onSuccess).toBeDefined();
		call.onSuccess?.();
		expect(mockRefresh).toHaveBeenCalled();
	});

	it('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);
		render(<DeleteItemButton {...defaultProps} />);
		expect(vi.mocked(ConfirmButton)).not.toHaveBeenCalled();
	});

	it('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);
		render(<DeleteItemButton {...defaultProps} />);
		expect(vi.mocked(ConfirmButton)).toHaveBeenCalled();
	});
});
