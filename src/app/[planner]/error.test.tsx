import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import PlannerError from './error';

vi.mock('@mantine/core', () => ({
	Button: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	Center: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Text: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
	Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe('PlannerError', () => {
	test('renders error message', () => {
		render(<PlannerError error={new Error('test')} reset={() => undefined} />);

		expect(screen.getByText('Something went wrong')).toBeDefined();
	});

	test('calls reset when try again is clicked', () => {
		const reset = vi.fn();
		render(<PlannerError error={new Error('test')} reset={reset} />);

		fireEvent.click(screen.getByText('Try again'));

		expect(reset).toHaveBeenCalled();
	});
});
