import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChangeNameForm } from './ChangeNameForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockRefresh = vi.fn();

const mockUpdateUserName = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/user', () => ({
	updateUserName: mockUpdateUserName,
}));

const defaultRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	prefetch: vi.fn(),
};

beforeAll(() => {
	vi.mocked(useRouter).mockReturnValue({
		...defaultRouter,
		refresh: mockRefresh,
	});
});

describe('ChangeNameForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows form when change name button is clicked', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));

		expect(screen.getByTestId('new-name-input')).toBeDefined();
		expect(screen.getByTestId('submit-name-change-button')).toBeDefined();
		expect(screen.getByTestId('cancel-name-change-button')).toBeDefined();
	});

	it('hides form when cancel is clicked', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('cancel-name-change-button'));

		expect(screen.queryByTestId('new-name-input')).toBeNull();
		expect(screen.getByTestId('change-name-button')).toBeDefined();
	});

	it('resets name input when cancel is clicked and form is reopened', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.change(screen.getByTestId('new-name-input'), {
			target: { value: 'Ariel II' },
		});
		fireEvent.click(screen.getByTestId('cancel-name-change-button'));
		fireEvent.click(screen.getByTestId('change-name-button'));

		expect(
			(screen.getByTestId('new-name-input') as HTMLInputElement).value,
		).toBe('');
	});

	it('calls updateUserName with new name on submit', async () => {
		mockUpdateUserName.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.change(screen.getByTestId('new-name-input'), {
			target: { value: 'Ariel II' },
		});
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(mockUpdateUserName).toHaveBeenCalledWith('Ariel II');
		});
	});

	it('hides form and calls router.refresh on success', async () => {
		mockUpdateUserName.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('new-name-input')).toBeNull();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	it('shows error alert when action returns error', async () => {
		mockUpdateUserName.mockResolvedValueOnce({
			ok: false,
			error: 'Contains invalid characters',
		});
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Contains invalid characters',
			);
		});
	});

	it('does not call router.refresh on error', async () => {
		mockUpdateUserName.mockResolvedValueOnce({
			ok: false,
			error: 'Some error',
		});
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});

		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
