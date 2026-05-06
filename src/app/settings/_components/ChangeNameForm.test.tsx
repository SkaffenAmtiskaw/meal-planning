import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useDisclosure } from '@mantine/hooks';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updateUserName } from '@/_actions/user';

import { ChangeNameForm } from './ChangeNameForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));
vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

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
	vi.mocked(useDisclosure).mockImplementation((initialState = false) => {
		const [opened, setOpened] = useState(initialState);
		return [
			opened,
			{
				open: vi.fn(() => setOpened(true)),
				close: vi.fn(() => setOpened(false)),
				toggle: vi.fn(() => setOpened((o: boolean) => !o)),
				set: vi.fn(),
			},
		];
	});
});

describe('ChangeNameForm', () => {
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

	it('calls updateUserName with new name on submit', () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.change(screen.getByTestId('new-name-input'), {
			target: { value: 'Ariel II' },
		});
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		expect(updateUserName).toHaveBeenCalledWith('Ariel II');
	});

	it('hides form and calls router.refresh on success', async () => {
		render(<ChangeNameForm currentName="Ariel" />);

		fireEvent.click(screen.getByTestId('change-name-button'));
		fireEvent.click(screen.getByTestId('submit-name-change-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('new-name-input')).toBeNull();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	it('shows error alert when action returns error', async () => {
		vi.mocked(updateUserName).mockResolvedValueOnce({
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
		vi.mocked(updateUserName).mockResolvedValueOnce({
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
