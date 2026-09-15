import { Flex, Text } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishListItem, type ListViewDish } from './DishListItem';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DishListItem.module.css', () => ({
	default: {
		dishName: 'dishName',
	},
}));

describe('DishListItem', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseDish: ListViewDish = { name: 'Grilled Salmon' };
	const renderName = vi.fn((dish: ListViewDish) => (
		<span data-testid="dish-name">{dish.name}</span>
	));

	it('renders the dish name via renderName', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.getByTestId('dish-name').textContent).toBe('Grilled Salmon');
		expect(renderName).toHaveBeenCalledWith(baseDish);
		expect(vi.mocked(Flex)).toHaveBeenCalledWith(
			expect.objectContaining({
				align: 'baseline',
				wrap: 'wrap',
			}),
			undefined,
		);
	});

	it('renders an external-link icon for url sources', () => {
		const { container } = render(
			<DishListItem
				dish={{ ...baseDish, source: { url: 'https://example.com' } }}
				renderName={renderName}
			/>,
		);

		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('does not render an external-link icon for non-url sources', () => {
		const { container } = render(
			<DishListItem
				dish={{ ...baseDish, source: { ref: 'Cookbook' } }}
				renderName={renderName}
			/>,
		);

		expect(container.querySelector('svg')).toBeNull();
	});

	it('renders a ref when source has ref', () => {
		render(
			<DishListItem
				dish={{ ...baseDish, source: { ref: 'Cookbook p.12' } }}
				renderName={renderName}
			/>,
		);

		expect(screen.getByText('Cookbook p.12')).toBeDefined();
		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				size: 'xs',
				c: 'navy.4',
				fs: 'italic',
				span: true,
			}),
			undefined,
		);
	});

	it('does not render a ref when source lacks ref', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.queryByText('Cookbook p.12')).toBeNull();
	});

	it('renders a note when present', () => {
		render(
			<DishListItem
				dish={{ ...baseDish, note: 'Use fresh herbs' }}
				renderName={renderName}
			/>,
		);

		expect(screen.getByText('Use fresh herbs')).toBeDefined();
		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				children: 'Use fresh herbs',
				size: 'xs',
				c: 'navy.4',
				span: true,
			}),
			undefined,
		);
	});

	it('does not render a note when absent', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.queryByText('Use fresh herbs')).toBeNull();
	});

	it('stops click propagation', () => {
		const parentOnClick = vi.fn();
		render(
			<div onClick={parentOnClick}>
				<DishListItem dish={baseDish} renderName={renderName} />
			</div>,
		);

		fireEvent.click(screen.getByTestId('dish-list-item'));

		expect(parentOnClick).not.toHaveBeenCalled();
	});
});
