import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FullWidthListItem } from './FullWidthListItem';

const mockListItem = vi.fn();

vi.mock('@mantine/core', () => ({
	ListItem: (props: object) => {
		mockListItem(props);
		return <li data-testid="list-item" />;
	},
}));

describe('FullWidthListItem', () => {
	beforeEach(() => {
		mockListItem.mockClear();
	});

	test('renders a ListItem', () => {
		render(<FullWidthListItem />);
		expect(screen.getByTestId('list-item')).toBeDefined();
	});

	test('merges caller-provided classNames with full-width overrides', () => {
		render(<FullWidthListItem classNames={{ item: 'custom-item' }} />);
		const { classNames } = mockListItem.mock.calls[0][0] as {
			classNames: Record<string, string>;
		};
		expect(classNames.item).toBe('custom-item');
	});

	test('passes through additional props to ListItem', () => {
		render(<FullWidthListItem data-custom="value" />);
		const props = mockListItem.mock.calls[0][0] as Record<string, unknown>;
		expect(props['data-custom']).toBe('value');
	});
});
