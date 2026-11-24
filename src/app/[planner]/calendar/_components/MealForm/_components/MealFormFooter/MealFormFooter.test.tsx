import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SubmitButton } from '@/_components';
import { useIsMobile } from '@/_hooks';

import { MealFormFooter } from './MealFormFooter';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@/_components', () => ({
	SubmitButton: vi.fn(() => null),
}));

const props = {
	dishCount: 2,
	status: 'idle' as const,
	countdown: 0,
	canSubmit: true,
	onCancel: vi.fn(),
};

describe('MealFormFooter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([
		{ canSubmit: true, disabled: false },
		{ canSubmit: false, disabled: true },
	])('disables Add Meal when canSubmit is $canSubmit', ({
		canSubmit,
		disabled,
	}) => {
		render(<MealFormFooter {...props} canSubmit={canSubmit} />);

		expect(vi.mocked(SubmitButton)).toHaveBeenLastCalledWith(
			expect.objectContaining({ disabled }),
			undefined,
		);
	});

	it('cancels from Cancel on desktop', () => {
		render(<MealFormFooter {...props} />);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(props.onCancel).toHaveBeenCalledTimes(1);
	});

	it('shows only a full-width Add Meal on a phone', () => {
		vi.mocked(useIsMobile).mockReturnValueOnce(true);
		render(<MealFormFooter {...props} />);

		expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
		expect(vi.mocked(SubmitButton)).toHaveBeenLastCalledWith(
			expect.objectContaining({ fullWidth: true }),
			undefined,
		);
	});
});
