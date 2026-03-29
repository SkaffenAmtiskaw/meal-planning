import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { createUser } from '@/_actions';

import { CreatePlannerPrompt } from './CreatePlannerPrompt';

vi.mock('@/_actions', () => ({
	createUser: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
	Alert: ({ children }: { children: React.ReactNode }) => (
		<div role="alert">{children}</div>
	),
	Center: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Typography: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Button: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

describe('create planner prompt', () => {
	test('renders the get started button', () => {
		render(<CreatePlannerPrompt email="ariel@sea.com" />);

		expect(screen.getByRole('button', { name: /get started/i })).toBeDefined();
	});

	test('clicking the button calls createUser with the email', async () => {
		vi.mocked(createUser).mockResolvedValue(undefined as never);

		render(<CreatePlannerPrompt email="ariel@sea.com" />);

		fireEvent.click(screen.getByRole('button', { name: /get started/i }));

		await waitFor(() => {
			expect(createUser).toHaveBeenCalledWith('ariel@sea.com');
		});
	});

	test('displays an error alert when createUser returns an error', async () => {
		vi.mocked(createUser).mockResolvedValue({
			error: 'Failed to create planner. Please try again.',
		});

		render(<CreatePlannerPrompt email="ariel@sea.com" />);

		fireEvent.click(screen.getByRole('button', { name: /get started/i }));

		await waitFor(() => {
			expect(screen.getByRole('alert')).toBeDefined();
			expect(
				screen.getByText('Failed to create planner. Please try again.'),
			).toBeDefined();
		});
	});

	test('does not display an error alert on success', async () => {
		vi.mocked(createUser).mockResolvedValue(undefined as never);

		render(<CreatePlannerPrompt email="ariel@sea.com" />);

		fireEvent.click(screen.getByRole('button', { name: /get started/i }));

		await waitFor(() => {
			expect(screen.queryByRole('alert')).toBeNull();
		});
	});
});
