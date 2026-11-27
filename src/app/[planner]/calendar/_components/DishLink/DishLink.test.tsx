import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Anchor, Text } from '@mantine/core';

import { DishLink } from './DishLink';

import type { ResolvedDish } from '../../_utils/types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('next/link', () => ({
	default: vi.fn(({ children, href }) => <a href={href}>{children}</a>),
}));

describe('DishLink', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('forwards tabIndex to the Anchor', () => {
		const dish: ResolvedDish = {
			_id: 'dish-1',
			name: 'Tab Dish',
			source: { url: 'https://example.com/recipe' },
		};

		render(<DishLink dish={dish} plannerId="planner-1" tabIndex={-1} />);

		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			tabIndex: -1,
		});
	});

	it('renders an external anchor that says it opens in a new tab, with no icon, for url sources', () => {
		const dish: ResolvedDish = {
			_id: 'dish-2',
			name: 'External Dish',
			source: { url: 'https://example.com/recipe' },
			note: 'Should not appear',
		};

		render(<DishLink dish={dish} plannerId="planner-1" />);

		const link = screen.getByRole('link', {
			// jsdom drops the space before the hidden text, which browsers keep.
			name: /^External Dish ?\(opens in a new tab\)$/,
		});
		expect(link.getAttribute('href')).toBe('https://example.com/recipe');
		expect(link.querySelector('svg')).toBeNull();
		expect(link.getAttribute('target')).toBe('_blank');
		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			rel: 'noreferrer',
		});
		expect(screen.queryByText('Should not appear')).toBeNull();
	});

	it('renders an internal recipe link for _id sources', () => {
		const dish: ResolvedDish = {
			_id: 'dish-3',
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
		const refDish: ResolvedDish = {
			_id: 'dish-4',
			name: 'Ref Dish',
			source: { ref: 'some-ref' },
			note: 'Should not appear',
		};
		const stringDish: ResolvedDish = {
			_id: 'dish-5',
			name: 'String Dish',
			source: 'some-source',
			note: 'Should not appear',
		};
		const missingDish: ResolvedDish = {
			_id: 'dish-6',
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

	it('defaults size to xs', () => {
		const dish: ResolvedDish = {
			_id: 'dish-7',
			name: 'Default Size Dish',
			source: { url: 'https://example.com/recipe' },
		};

		render(<DishLink dish={dish} plannerId="planner-1" />);

		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			size: 'xs',
		});
	});

	it('passes size="sm" to the anchor for url sources', () => {
		const dish: ResolvedDish = {
			_id: 'dish-8',
			name: 'Sm Url Dish',
			source: { url: 'https://example.com/recipe' },
		};

		render(<DishLink dish={dish} plannerId="planner-1" size="sm" />);

		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			size: 'sm',
		});
	});

	it('passes size="sm" to the anchor for _id sources', () => {
		const dish: ResolvedDish = {
			_id: 'dish-9',
			name: 'Sm Saved Dish',
			source: { _id: 'recipe-123' },
		};

		render(<DishLink dish={dish} plannerId="planner-1" size="sm" />);

		expect(vi.mocked(Anchor).mock.calls[0][0]).toMatchObject({
			size: 'sm',
		});
	});

	it('passes size="sm" to Text for non-link sources', () => {
		const dish: ResolvedDish = {
			_id: 'dish-10',
			name: 'Sm Text Dish',
			source: { ref: 'some-ref' },
		};

		render(<DishLink dish={dish} plannerId="planner-1" size="sm" />);

		expect(vi.mocked(Text).mock.calls[0][0]).toMatchObject({
			size: 'sm',
		});
	});
});
