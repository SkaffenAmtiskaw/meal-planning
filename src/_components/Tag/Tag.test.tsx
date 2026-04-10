import { render, screen } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { Tag } from './Tag';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('Tag', () => {
	it('renders children text', () => {
		render(<Tag color="tangerine">Breakfast</Tag>);
		expect(screen.getByText('Breakfast')).toBeTruthy();
	});

	it('applies correct background color', () => {
		const { container } = render(<Tag color="fern">Vegetarian</Tag>);
		const badge = container.querySelector(
			'[data-testid="badge"]',
		) as HTMLElement | null;
		expect(badge).toBeTruthy();
		expect(badge?.style.backgroundColor).toBe('rgb(228, 242, 228)');
	});

	it('applies correct text color', () => {
		const { container } = render(<Tag color="fern">Vegetarian</Tag>);
		const badge = container.querySelector(
			'[data-testid="badge"]',
		) as HTMLElement | null;
		expect(badge).toBeTruthy();
		expect(badge?.style.color).toBe('rgb(30, 77, 30)');
	});

	it('renders all 10 tag colors without error', () => {
		const colors = [
			'tangerine',
			'rosewood',
			'honey',
			'fern',
			'seafoam',
			'steel',
			'lavender',
			'mauve',
			'sageMist',
			'slate',
		] as const;

		for (const color of colors) {
			const { container } = render(<Tag color={color}>Test</Tag>);
			expect(container.querySelector('[data-testid="badge"]')).toBeTruthy();
		}
	});
});
