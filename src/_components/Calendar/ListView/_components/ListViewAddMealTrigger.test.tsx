import { ActionIcon, Flex, Text } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListViewAddMealTrigger } from './ListViewAddMealTrigger';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DayRow.module.css', () => ({
	default: {
		addButton: 'addButton',
		ghostRow: 'ghostRow',
	},
}));

describe('ListViewAddMealTrigger', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders gutter variant as an ActionIcon with IconPlus', () => {
		render(<ListViewAddMealTrigger variant="gutter" onClick={vi.fn()} />);

		expect(screen.getByRole('button')).toBeDefined();
		expect(vi.mocked(ActionIcon)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(ActionIcon)).toHaveBeenCalledWith(
			expect.objectContaining({
				className: 'addButton',
				variant: 'default',
				size: 22,
				radius: 'xl',
				color: 'forest',
			}),
			undefined,
		);
	});

	it('calls onClick when gutter ActionIcon is clicked', () => {
		const onClick = vi.fn();

		render(<ListViewAddMealTrigger variant="gutter" onClick={onClick} />);

		screen.getByRole('button').click();

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders ghost variant as a Flex with Add meal text', () => {
		render(<ListViewAddMealTrigger variant="ghost" onClick={vi.fn()} />);

		expect(screen.getByText('Add meal')).toBeDefined();
		expect(vi.mocked(Flex)).toHaveBeenCalledTimes(1);
		expect(vi.mocked(Flex)).toHaveBeenCalledWith(
			expect.objectContaining({
				className: 'ghostRow',
				align: 'center',
				gap: 8,
			}),
			undefined,
		);
		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				children: 'Add meal',
				size: 'sm',
				fw: 600,
				c: 'forest',
			}),
			undefined,
		);
	});

	it('calls onClick when ghost Flex is clicked', () => {
		const onClick = vi.fn();

		render(<ListViewAddMealTrigger variant="ghost" onClick={onClick} />);

		screen.getByText('Add meal').click();

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
