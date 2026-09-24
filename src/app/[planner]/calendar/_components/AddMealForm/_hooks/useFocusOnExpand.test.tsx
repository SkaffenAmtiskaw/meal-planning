import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFocusOnExpand } from './useFocusOnExpand';

function ControlledTestComponent({
	initialExpanded = false,
}: {
	initialExpanded?: boolean;
}) {
	const [expanded, setExpanded] = useState(initialExpanded);
	const { ref, requestFocus } = useFocusOnExpand<HTMLInputElement>(expanded);

	return (
		<>
			<input ref={ref} data-testid="target" />
			<button
				data-testid="request-expand"
				onClick={() => {
					requestFocus();
					setExpanded(true);
				}}
			>
				Request and expand
			</button>
			<button data-testid="expand" onClick={() => setExpanded(true)}>
				Expand
			</button>
		</>
	);
}

describe('useFocusOnExpand', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	it('focuses after expand when requested', () => {
		render(<ControlledTestComponent />);
		fireEvent.click(screen.getByTestId('request-expand'));
		vi.runAllTimers();
		expect(screen.getByTestId('target')).toBe(document.activeElement);
	});

	it('does not focus when not requested', () => {
		render(<ControlledTestComponent />);
		fireEvent.click(screen.getByTestId('expand'));
		vi.runAllTimers();
		expect(screen.getByTestId('target')).not.toBe(document.activeElement);
	});

	it('does not focus when already expanded without a request', () => {
		render(<ControlledTestComponent initialExpanded={true} />);
		vi.runAllTimers();
		expect(screen.getByTestId('target')).not.toBe(document.activeElement);
	});

	it('cleanup cancels a pending rAF', () => {
		const { unmount, container } = render(<ControlledTestComponent />);
		const input = container.querySelector('input') as HTMLInputElement;
		const focusSpy = vi.spyOn(input, 'focus');

		fireEvent.click(screen.getByTestId('request-expand'));
		unmount();
		vi.runAllTimers();

		expect(focusSpy).not.toHaveBeenCalled();
		focusSpy.mockRestore();
	});
});
