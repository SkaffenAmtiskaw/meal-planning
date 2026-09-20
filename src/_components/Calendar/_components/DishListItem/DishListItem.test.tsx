import { Group, Stack, Text } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CalendarDish, DishListItem } from './DishListItem';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DishListItem.module.css', () => ({
	default: {
		dishName: 'dishName',
		dishNote: 'dishNote',
	},
}));

describe('DishListItem', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseDish: CalendarDish = { name: 'Grilled Salmon' };
	const renderName = vi.fn((dish: CalendarDish) => (
		<span data-testid="dish-name">{dish.name}</span>
	));

	it('renders the dish name via renderName', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.getByTestId('dish-name').textContent).toBe('Grilled Salmon');
		expect(renderName).toHaveBeenCalledWith(baseDish);
	});

	it('uses a vertical Stack for the dish block with a small gap', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.getByTestId('dish-list-item')).toBeDefined();
		expect(vi.mocked(Stack)).toHaveBeenCalledWith(
			expect.objectContaining({
				gap: 1,
				'data-testid': 'dish-list-item',
			}),
			undefined,
		);
	});

	it('renders the name line in a baseline Group', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(vi.mocked(Group)).toHaveBeenCalledWith(
			expect.objectContaining({
				align: 'baseline',
				gap: 'xs',
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
				children: 'Cookbook p.12',
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

	it('renders a note on its own line when present', () => {
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
				c: 'navy',
				lh: 1.5,
				maw: '60ch',
				className: 'dishNote',
			}),
			undefined,
		);

		const stack = screen.getByTestId('dish-list-item');
		expect(stack.children).toHaveLength(2);
		expect(stack.children[1].textContent).toBe('Use fresh herbs');
	});

	it('does not render a note line when absent', () => {
		render(<DishListItem dish={baseDish} renderName={renderName} />);

		expect(screen.queryByText('Use fresh herbs')).toBeNull();
		expect(screen.getByTestId('dish-list-item').children).toHaveLength(1);
	});

	it('preserves newlines in a note', () => {
		render(
			<DishListItem
				dish={{ ...baseDish, note: 'Start at 6:15\nKeep it mild' }}
				renderName={renderName}
			/>,
		);

		const note = screen.getByText(
			(content) =>
				content.includes('Start at 6:15') && content.includes('Keep it mild'),
		);
		expect(note).toBeDefined();
		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				children: 'Start at 6:15\nKeep it mild',
				className: 'dishNote',
			}),
			undefined,
		);
	});

	it('does not truncate or line-clamp a long note', () => {
		const longNote = 'x'.repeat(1200);
		render(
			<DishListItem
				dish={{ ...baseDish, note: longNote }}
				renderName={renderName}
			/>,
		);

		expect(screen.getByText(longNote)).toBeDefined();
		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				children: longNote,
				className: 'dishNote',
			}),
			undefined,
		);
		expect(vi.mocked(Text)).not.toHaveBeenCalledWith(
			expect.objectContaining({ lineClamp: expect.anything() }),
			undefined,
		);
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
