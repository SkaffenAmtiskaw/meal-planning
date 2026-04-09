import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { ChangeNameForm } from './ChangeNameForm';

const mockRefresh = vi.fn();
const mockUpdateUserName = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/user', () => ({
	updateUserName: (name: string) => mockUpdateUserName(name),
}));

describe('ChangeNameForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('displays current name', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		expect(screen.getByTestId('current-name').textContent).toBe('Ariel');
	});

	test('shows change name button', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		expect(screen.getByTestId('change-name-button')).toBeDefined();
	});

	test('shows form when change name button is clicked', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));

		expect(screen.getByTestId('new-name-input')).toBeDefined();
		expect(screen.getByTestId('submit-name-change-button')).toBeDefined();
		expect(screen.getByTestId('cancel-name-change-button')).toBeDefined();
	});

	test('hides form when cancel is clicked', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('cancel-name-change-button'));

		expect(screen.queryByTestId('new-name-input')).toBeNull();
		expect(screen.getByTestId('change-name-button')).toBeDefined();
	});

	test('resets name input when cancel is clicked and form is reopened', () => {
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

	test('updates name input value', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.change(screen.getByTestId('new-name-input'), {
			target: { value: 'Ariel II' },
		});

		expect(
			(screen.getByTestId('new-name-input') as HTMLInputElement).value,
		).toBe('Ariel II');
	});

	test('calls updateUserName with new name on submit', async () => {
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

	test('hides form and calls router.refresh on success', async () => {
		mockUpdateUserName.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('new-name-input')).toBeNull();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	test('shows error alert when action returns error', async () => {
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

	test('does not call router.refresh on error', async () => {
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
