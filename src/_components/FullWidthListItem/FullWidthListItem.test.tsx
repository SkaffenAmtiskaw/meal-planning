import { ListItem } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FullWidthListItem } from './FullWidthListItem';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('FullWidthListItem', () => {
	beforeEach(() => {
		vi.mocked(ListItem).mockClear();
	});

	test('renders a ListItem', () => {
		render(<FullWidthListItem />);
		expect(screen.getByRole('listitem')).toBeDefined();
	});

	test('merges caller-provided classNames with full-width overrides', () => {
		render(<FullWidthListItem classNames={{ item: 'custom-item' }} />);
		const { classNames } = vi.mocked(ListItem).mock.calls[0][0] as {
			classNames: Record<string, string>;
		};
		expect(classNames.item).toBe('custom-item');
	});

	test('passes through additional props to ListItem', () => {
		render(<FullWidthListItem data-custom="value" />);
		const props = vi.mocked(ListItem).mock.calls[0][0] as Record<
			string,
			unknown
		>;
		expect(props['data-custom']).toBe('value');
	});
});
