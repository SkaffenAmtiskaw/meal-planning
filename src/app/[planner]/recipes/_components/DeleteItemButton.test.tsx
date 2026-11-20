import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmButton } from '@/_components';
import { useCanWrite } from '@/app/[planner]/_components';

import { DeleteItemButton } from './DeleteItemButton';

vi.mock(
	'@/app/[planner]/_components',
	async () => await import('#mocks/@/app/[planner]/_components'),
);

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_components', () => ({
	ConfirmButton: vi.fn(({ renderTrigger }) => renderTrigger?.(() => {})),
}));

const defaultProps = {
	onDelete: vi.fn(),
	title: 'Delete Item',
	message: 'Are you sure?',
};

describe('DeleteItemButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('does not render when user has read-only access', () => {
		vi.mocked(useCanWrite).mockReturnValue(false);
		render(<DeleteItemButton {...defaultProps} />);
		expect(vi.mocked(ConfirmButton)).not.toHaveBeenCalled();
	});

	it('renders when user has write access', () => {
		render(<DeleteItemButton {...defaultProps} />);
		expect(vi.mocked(ConfirmButton)).toHaveBeenCalled();
	});
});
