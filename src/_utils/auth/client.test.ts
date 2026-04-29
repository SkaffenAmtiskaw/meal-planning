import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockOneTapClient = vi.fn();
const mockCreateAuthClient = vi.fn();

vi.mock('better-auth/client/plugins', () => ({
	oneTapClient: mockOneTapClient,
}));

vi.mock('better-auth/react', () => ({
	createAuthClient: mockCreateAuthClient,
}));

describe('auth client', () => {
	beforeEach(() => {
		vi.resetModules();
		mockOneTapClient.mockClear();
		mockCreateAuthClient.mockClear();
	});

	test('creates auth client with one tap plugin', async () => {
		const mockPlugin = { name: 'oneTap' };
		mockOneTapClient.mockReturnValue(mockPlugin);

		await import('./client');

		expect(mockOneTapClient).toHaveBeenCalledWith({
			clientId: 'fake-google-client-id',
			autoSelect: true,
			context: 'signin',
		});

		expect(mockCreateAuthClient).toHaveBeenCalledWith({
			plugins: [mockPlugin],
		});
	});

	test('passes google client id from env to one tap plugin', async () => {
		await import('./client');

		const [[{ clientId }]] = mockOneTapClient.mock.calls;
		expect(clientId).toBe('fake-google-client-id');
	});
});
