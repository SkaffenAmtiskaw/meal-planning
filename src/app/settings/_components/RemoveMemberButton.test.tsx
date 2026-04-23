import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RemoveMemberButton } from './RemoveMemberButton';

const mockRemove = vi.fn();

const { mockUseRemoveMember } = vi.hoisted(() => {
	const mockUseRemoveMember = vi.fn(() => ({
		remove: mockRemove,
		isLoading: false,
		error: null,
	}));
	return { mockUseRemoveMember };
});

vi.mock('../_hooks/useRemoveMember', () => ({
	useRemoveMember: mockUseRemoveMember,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const { mockOpen, mockClose, mockUseDisclosure } = vi.hoisted(() => {
	const mockOpen = vi.fn();
	const mockClose = vi.fn();
	const mockUseDisclosure = vi.fn(() => [
		false,
		{ open: mockOpen, close: mockClose },
	]);
	return { mockOpen, mockClose, mockUseDisclosure };
});

vi.mock('@mantine/hooks', () => ({
	useDisclosure: mockUseDisclosure,
}));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => <svg data-testid="icon-trash" />,
}));

describe('RemoveMemberButton', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const memberName = 'John Doe';
	const onRemove = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		mockUseDisclosure.mockReturnValue([
			false,
			{ open: mockOpen, close: mockClose },
		]);
		mockUseRemoveMember.mockReturnValue({
			remove: mockRemove,
			isLoading: false,
			error: null,
		});
	});

	it('renders trash icon button', () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		expect(screen.getByTestId('remove-member-button')).toBeDefined();
		expect(screen.getByTestId('icon-trash')).toBeDefined();
	});

	it('opens confirmation modal on click', () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('remove-member-button'));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('calls remove from hook and onRemove callback on successful confirm', async () => {
		mockRemove.mockResolvedValue(true);
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('confirm-remove-button'));

		await waitFor(() => {
			expect(mockRemove).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(onRemove).toHaveBeenCalled();
		});
	});

	it('does not call onRemove when removal fails', async () => {
		mockRemove.mockResolvedValue(false);
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('confirm-remove-button'));

		await waitFor(() => {
			expect(mockRemove).toHaveBeenCalled();
		});

		expect(onRemove).not.toHaveBeenCalled();
	});

	it('closes modal after successful removal', async () => {
		mockRemove.mockResolvedValue(true);
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('confirm-remove-button'));

		await waitFor(() => {
			expect(mockClose).toHaveBeenCalled();
		});
	});

	it('does not close modal when removal fails', async () => {
		mockRemove.mockResolvedValue(false);
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('confirm-remove-button'));

		await waitFor(() => {
			expect(mockRemove).toHaveBeenCalled();
		});

		expect(mockClose).not.toHaveBeenCalled();
	});

	it('closes modal when cancel is clicked', () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('cancel-remove-button'));

		expect(mockClose).toHaveBeenCalled();
		expect(mockRemove).not.toHaveBeenCalled();
	});

	it('shows loading state from hook', () => {
		mockUseRemoveMember.mockReturnValue({
			remove: mockRemove,
			isLoading: true,
			error: null,
		});
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const confirmButton = screen.getByTestId('confirm-remove-button');
		expect(confirmButton.getAttribute('data-loading')).toBe('true');
	});

	it('passes correct props to useRemoveMember hook', () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		expect(mockUseRemoveMember).toHaveBeenCalledWith(plannerId, memberEmail);
	});
});
