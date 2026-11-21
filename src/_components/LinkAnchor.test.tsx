import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { LinkAnchor } from './LinkAnchor';

vi.mock('next/link', () => ({
	default: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('LinkAnchor', () => {
	it('renders (coverage only, no logic)', () => {
		render(<LinkAnchor href="/test-path">Click Me</LinkAnchor>);
	});
});
