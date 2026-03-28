import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { createUser } from '@/_actions';

import { CreatePlannerPrompt } from './CreatePlannerPrompt';

vi.mock('@/_actions', () => ({
	createUser: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
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

	test('clicking the button calls createUser with the email', () => {
		render(<CreatePlannerPrompt email="ariel@sea.com" />);

		fireEvent.click(screen.getByRole('button', { name: /get started/i }));

		expect(createUser).toHaveBeenCalledWith('ariel@sea.com');
	});
});
