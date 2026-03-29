import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/saved';

import { DeleteRecipeButton } from './DeleteRecipeButton';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/saved', () => ({
	deleteRecipe: vi.fn(),
}));

const { mockUseFormFeedback } = vi.hoisted(() => {
	const mockUseFormFeedback = vi.fn(() => ({
		status: 'idle' as FeedbackStatus,
		errorMessage: undefined as string | undefined,
		wrap: (fn: () => Promise<void>, onSuccess: () => void) => async () => {
			await fn();
			onSuccess();
		},
		reset: vi.fn(),
	}));
	return { mockUseFormFeedback };
});

vi.mock('@/_hooks', () => ({
	useFormFeedback: () => mockUseFormFeedback(),
}));

vi.mock('@mantine/core', () => ({
	ActionIcon: ({
		children,
		disabled,
		onClick,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		onClick?: () => void;
		'data-testid'?: string;
	}) => (
		<button
			data-testid={testId}
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	),
}));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => null,
}));

vi.mock('./DeleteConfirmModal', () => ({
	DeleteConfirmModal: ({
		errorMessage,
		loading,
		onClose,
		onConfirm,
		opened,
	}: {
		opened: boolean;
		onClose: () => void;
		onConfirm: () => void;
		loading: boolean;
		errorMessage?: string;
	}) =>
		opened ? (
			<div data-testid="delete-confirm-modal">
				<span data-testid="modal-loading">{String(loading)}</span>
				{errorMessage && <span data-testid="modal-error">{errorMessage}</span>}
				<button data-testid="modal-cancel" onClick={onClose} type="button">
					Cancel
				</button>
				<button data-testid="modal-confirm" onClick={onConfirm} type="button">
					Delete
				</button>
			</div>
		) : null,
}));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

const defaultFormFeedback = () => ({
	status: 'idle' as FeedbackStatus,
	errorMessage: undefined as string | undefined,
	wrap: (fn: () => Promise<void>, onSuccess: () => void) => async () => {
		await fn();
		onSuccess();
	},
	reset: vi.fn(),
});

beforeEach(() => {
	mockUseFormFeedback.mockImplementation(defaultFormFeedback);
	vi.clearAllMocks();
});

describe('DeleteRecipeButton', () => {
	test('renders a delete button', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	test('button is enabled by default', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(
			(screen.getByTestId('delete-button') as HTMLButtonElement).disabled,
		).toBe(false);
	});

	test('button is disabled when disabled prop is true', () => {
		render(
			<DeleteRecipeButton disabled plannerId={plannerId} recipeId={recipeId} />,
		);
		expect(
			(screen.getByTestId('delete-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	test('modal is not shown initially', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
	});

	test('clicking delete button opens modal', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('delete-confirm-modal')).toBeDefined();
	});

	test('clicking cancel in modal closes it without calling deleteRecipe', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-cancel'));
		expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
		expect(deleteRecipe).not.toHaveBeenCalled();
	});

	test('confirming in modal calls deleteRecipe and refreshes', async () => {
		vi.mocked(deleteRecipe).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(deleteRecipe).toHaveBeenCalledWith({ plannerId, recipeId });
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	test('modal closes after confirmed delete', async () => {
		vi.mocked(deleteRecipe).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
		});
	});

	test('disabled button does not open modal', () => {
		render(
			<DeleteRecipeButton disabled plannerId={plannerId} recipeId={recipeId} />,
		);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
	});

	test('passes loading=true to modal when status is submitting', () => {
		mockUseFormFeedback.mockImplementation(() => ({
			status: 'submitting' as FeedbackStatus,
			errorMessage: undefined,
			wrap: vi.fn(),
			reset: vi.fn(),
		}));
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('modal-loading').textContent).toBe('true');
	});

	test('passes errorMessage to modal when status is error', () => {
		mockUseFormFeedback.mockImplementation(() => ({
			status: 'error' as FeedbackStatus,
			errorMessage: 'Delete failed',
			wrap: vi.fn(),
			reset: vi.fn(),
		}));
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('modal-error').textContent).toBe('Delete failed');
	});
});
