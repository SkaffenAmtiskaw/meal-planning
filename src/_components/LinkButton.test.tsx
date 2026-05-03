import Link from 'next/link';

import { Button } from '@mantine/core';

import { render } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { LinkButton } from './LinkButton';

vi.mock('next/link', () => ({
	default: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('LinkButton', () => {
	it('passes component and href to Button', () => {
		render(<LinkButton href="/test-path">Click Me</LinkButton>);
		expect(Button).toHaveBeenCalledWith(
			expect.objectContaining({
				component: Link,
				href: '/test-path',
				children: 'Click Me',
			}),
			undefined,
		);
	});
});
