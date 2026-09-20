import { usePathname, useRouter } from 'next/navigation';

import { Modal } from '@mantine/core';

import { render } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { ModalWrapper } from './ModalWrapper';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('modal wrapper', () => {
	const mockPush = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
		vi.mocked(usePathname).mockReturnValue('/jafar-planner/recipes');
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('navigates to pathname when Modal onClose is called', () => {
		render(<ModalWrapper opened />);
		const call = vi.mocked(Modal).mock.calls[0][0];
		call.onClose?.();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});

	test('calls custom onClose then navigates when Modal onClose is called', () => {
		const onClose = vi.fn();
		render(<ModalWrapper opened onClose={onClose} />);
		const call = vi.mocked(Modal).mock.calls[0][0];
		call.onClose?.();
		expect(onClose).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});
});
