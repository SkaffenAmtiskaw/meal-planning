import { renderHook } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { useOneTap } from './useOneTap';

vi.mock('@/_utils/auth', () => ({
	client: {
		useSession: vi.fn(),
		oneTap: vi.fn(),
	},
}));

describe('use one tap', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should not call oneTap when session data exists', () => {
		vi.mocked(client.useSession).mockReturnValue({
			data: { user: { id: '1', email: 'test@example.com' } },
			isPending: false,
		} as unknown as ReturnType<typeof client.useSession>);

		renderHook(() => useOneTap());

		expect(client.oneTap).not.toHaveBeenCalled();
	});

	test('should not call oneTap when session is pending', () => {
		vi.mocked(client.useSession).mockReturnValue({
			data: null,
			isPending: true,
		} as unknown as ReturnType<typeof client.useSession>);

		renderHook(() => useOneTap());

		expect(client.oneTap).not.toHaveBeenCalled();
	});

	test('should call oneTap when there is no session and not pending', () => {
		vi.mocked(client.useSession).mockReturnValue({
			data: null,
			isPending: false,
		} as unknown as ReturnType<typeof client.useSession>);

		renderHook(() => useOneTap());

		expect(client.oneTap).toHaveBeenCalledOnce();
	});
});
