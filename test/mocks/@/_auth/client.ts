/**
 * Shared mock for @/_auth/client.
 *
 * Usage in a test file:
 *   vi.mock('@/_auth/client', async () => await import('#mocks/@/_auth/client'))
 *
 * Each call resolves to better-auth's empty result, `{ data: null, error: null }`, and the default
 * survives `vi.resetAllMocks()`. Use `vi.mocked(client.signIn.email).mockResolvedValueOnce(...)` etc.
 * to override for a single test.
 */

import { vi } from 'vitest';

const emptyResult = async () => ({ data: null, error: null });

export const client = {
	signIn: {
		social: vi.fn(emptyResult),
		email: vi.fn(emptyResult),
	},
	signUp: {
		email: vi.fn(emptyResult),
	},
	signOut: vi.fn(emptyResult),
	changePassword: vi.fn(emptyResult),
	requestPasswordReset: vi.fn(emptyResult),
	resetPassword: vi.fn(emptyResult),
	sendVerificationEmail: vi.fn(emptyResult),
	oneTap: vi.fn(emptyResult),
	useSession: vi.fn(() => ({ data: null, isPending: false })),
};
