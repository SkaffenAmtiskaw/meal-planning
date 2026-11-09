import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import posthog from 'posthog-js';

import PlannerError from './error';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('posthog-js', async () => await import('#mocks/posthog-js'));

describe('PlannerError', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('reports each error once', () => {
		const error = new Error('test');
		const { rerender } = render(
			<PlannerError error={error} reset={() => undefined} />,
		);
		rerender(<PlannerError error={error} reset={() => undefined} />);

		expect(posthog.captureException).toHaveBeenCalledExactlyOnceWith(error);

		const next = new Error('next');
		rerender(<PlannerError error={next} reset={() => undefined} />);

		expect(posthog.captureException).toHaveBeenLastCalledWith(next);
		expect(posthog.captureException).toHaveBeenCalledTimes(2);
	});
});
