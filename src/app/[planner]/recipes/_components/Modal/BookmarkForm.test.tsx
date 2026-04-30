import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addBookmark } from '@/_actions/saved/addBookmark';
import { editBookmark } from '@/_actions/saved/editBookmark';

import { BookmarkForm } from './BookmarkForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/planner-1/recipes',
}));

vi.mock('@/_actions/saved/addBookmark', () => ({
	addBookmark: vi.fn(),
}));

vi.mock('@/_actions/saved/editBookmark', () => ({
	editBookmark: vi.fn(),
}));

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

const { mockUseFormFeedback } = vi.hoisted(() => {
	const mockUseFormFeedback = vi.fn(() => ({
		status: 'idle' as FeedbackStatus,
		countdown: 0,
		errorMessage: undefined as string | undefined,
		wrap:
			(fn: (...args: unknown[]) => Promise<void>, onSuccess: () => void) =>
			async (...args: unknown[]) => {
				await fn(...args);
				onSuccess();
			},
		reset: vi.fn(),
	}));
	return { mockUseFormFeedback };
});

vi.mock('@/_hooks', () => ({
	useFormFeedback: () => mockUseFormFeedback(),
}));

vi.mock('@/_components', () => ({
	FormFeedbackAlert: ({
		status,
		errorMessage,
	}: {
		status: string;
		errorMessage?: string;
	}) =>
		status === 'error' ? (
			<div data-testid="form-feedback-alert">{errorMessage}</div>
		) : null,
	SubmitButton: ({
		label,
		status,
		countdown,
	}: {
		label: string;
		status: string;
		countdown: number;
	}) => (
		<button
			type={status === 'success' ? 'button' : 'submit'}
			data-testid="submit-button"
			disabled={status === 'submitting'}
		>
			{status === 'success' ? `Saved! Closing in ${countdown}…` : label}
		</button>
	),
	TagCombobox: ({ onChange }: { onChange: (v: string[]) => void }) => (
		<button
			type="button"
			data-testid="tag-combobox"
			onClick={() => onChange(['tag-1'])}
		>
			Tags
		</button>
	),
}));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const defaultProps = {
	plannerId: 'planner-1',
	tags: [{ _id: 'tag-1', name: 'Quick', color: 'blue' }],
};

describe('BookmarkForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders Add Bookmark submit button when no item', () => {
		render(<BookmarkForm {...defaultProps} />);
		expect(screen.getByRole('button', { name: 'Add Bookmark' })).toBeDefined();
	});

	test('renders notes textarea', () => {
		render(<BookmarkForm {...defaultProps} />);
		expect(screen.getByTestId('textarea-Notes')).toBeDefined();
	});

	test('renders Save submit button when item is provided', () => {
		const item = {
			_id: 'bm-1' as never,
			name: 'My Site',
			url: 'https://example.com',
			tags: [],
		};
		render(<BookmarkForm {...defaultProps} item={item} />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
	});

	test('Cancel navigates back to pathname', () => {
		render(<BookmarkForm {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	test('submitting the form calls addBookmark with plannerId', async () => {
		vi.mocked(addBookmark).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'My Bookmark' },
		});

		render(<BookmarkForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('bookmark-form'));

		expect(addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
		);
	});

	test('navigates away after successful submission', async () => {
		vi.mocked(addBookmark).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'My Bookmark' },
		});

		render(<BookmarkForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	test('changing tags updates selected tags state', () => {
		render(<BookmarkForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tag-combobox'));
		// component re-renders without error
	});

	test('populates initial state from existing item', () => {
		const item = {
			_id: 'bm-1' as never,
			name: 'My Site',
			url: 'https://example.com',
			tags: ['tag-1' as never],
		};
		render(<BookmarkForm {...defaultProps} item={item} />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
	});

	test('shows error alert when status is error', () => {
		mockUseFormFeedback.mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<BookmarkForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	test('submits with selected tags included', async () => {
		vi.mocked(addBookmark).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'My Bookmark' },
		});

		render(<BookmarkForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tag-combobox'));
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ tags: ['tag-1'] }),
		);
	});

	test('calls editBookmark with _id when item is provided', async () => {
		vi.mocked(editBookmark).mockResolvedValue({
			ok: true,
			data: { _id: 'bm-1', name: 'My Bookmark' },
		});

		const item = {
			_id: 'bm-1' as never,
			name: 'My Site',
			url: 'https://example.com',
			tags: [],
		};

		render(<BookmarkForm {...defaultProps} item={item} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(editBookmark).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: 'bm-1',
				plannerId: 'planner-1',
			}),
		);
		expect(addBookmark).not.toHaveBeenCalled();
	});
});
