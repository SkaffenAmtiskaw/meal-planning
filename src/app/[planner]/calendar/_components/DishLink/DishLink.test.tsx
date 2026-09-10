import { Anchor } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { DishLink } from './DishLink';

import type { SerializedDish } from '../../_utils/toScheduleXEvents';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('next/link', () => ({
	default: vi.fn(({ children, href }) => <a href={href}>{children}</a>),
}));

describe('DishLink', () => {
	it('renders an external anchor for url sources', () => {
		const dish: SerializedDish = {
			name: 'External Dish',
			source: { url: 'https://example.com/recipe' },
			note: 'Should not appear',
		};

		render(<DishLink dish={dish} plannerId="planner-1" />);

		const link = screen.getByRole('link', { name: 'External Dish' });
		expect(link.getAttribute('href')).toBe('https://example.com/recipe');
		expect(link.getAttribute('target')).toBe('_blank');
		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			rel: 'noreferrer',
		});
		expect(screen.queryByText('Should not appear')).toBeNull();
	});

	it('renders an internal recipe link for _id sources', () => {
		const dish: SerializedDish = {
			name: 'Saved Dish',
			source: { _id: 'recipe-123' },
			note: 'Should not appear',
		};

		render(<DishLink dish={dish} plannerId="planner-1" />);

		const link = screen.getByRole('link', { name: 'Saved Dish' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-123');
		expect(screen.queryByText('Should not appear')).toBeNull();
	});

	it('renders plain text for ref, string, or missing sources', () => {
		const refDish: SerializedDish = {
			name: 'Ref Dish',
			source: { ref: 'some-ref' },
			note: 'Should not appear',
		};
		const stringDish: SerializedDish = {
			name: 'String Dish',
			source: 'some-source',
			note: 'Should not appear',
		};
		const missingDish: SerializedDish = {
			name: 'Missing Dish',
			note: 'Should not appear',
		};

		const { rerender } = render(
			<DishLink dish={refDish} plannerId="planner-1" />,
		);
		expect(screen.getByText('Ref Dish')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.queryByText('some-ref')).toBeNull();
		expect(screen.queryByText('Should not appear')).toBeNull();

		rerender(<DishLink dish={stringDish} plannerId="planner-1" />);
		expect(screen.getByText('String Dish')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.queryByText('some-source')).toBeNull();
		expect(screen.queryByText('Should not appear')).toBeNull();

		rerender(<DishLink dish={missingDish} plannerId="planner-1" />);
		expect(screen.getByText('Missing Dish')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.queryByText('Should not appear')).toBeNull();
	});
});
