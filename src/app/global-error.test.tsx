import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import posthog from 'posthog-js';

import GlobalError from './global-error';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('posthog-js', async () => await import('#mocks/posthog-js'));
vi.mock('@/_theme', () => ({ theme: {} }));

describe('GlobalError', () => {
	test('reports the error', () => {
		const error = new Error('test');
		render(<GlobalError error={error} reset={() => undefined} />, {
			container: document,
		});

		expect(posthog.captureException).toHaveBeenCalledExactlyOnceWith(error);
	});
});
