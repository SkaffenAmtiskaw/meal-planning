import Link from 'next/link';

import { NavLink as MantineNavLink } from '@mantine/core';

import { render } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { NavLink } from './NavLink';

vi.mock('next/link', () => ({
	default: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('NavLink', () => {
	it('passes component and href to NavLink', () => {
		render(<NavLink href="/test-path" label="Test Link" />);
		expect(MantineNavLink).toHaveBeenCalledWith(
			expect.objectContaining({
				component: Link,
				href: '/test-path',
				label: 'Test Link',
			}),
			undefined,
		);
	});
});
