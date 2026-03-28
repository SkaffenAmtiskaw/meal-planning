import { render } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { ModalWrapper } from './ModalWrapper';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/jafar-planner/recipes',
}));

let capturedOnClose: (() => void) | undefined;
vi.mock('@mantine/core', () => ({
	Modal: (props: { onClose?: () => void }) => {
		capturedOnClose = props.onClose;
		return null;
	},
}));

describe('modal wrapper', () => {
	afterEach(() => {
		vi.resetAllMocks();
		capturedOnClose = undefined;
	});

	test('navigates to current pathname when closed', () => {
		render(<ModalWrapper opened />);

		capturedOnClose?.();

		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});

	test('calls the provided onClose callback and then navigates when closed', () => {
		const onClose = vi.fn();
		render(<ModalWrapper opened onClose={onClose} />);

		capturedOnClose?.();

		expect(onClose).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});
});
