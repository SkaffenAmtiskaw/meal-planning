import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tag } from './Tag';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('Tag', () => {
	it('draws a bordered badge in the tag palette', () => {
		render(<Tag color="fern">Vegetarian</Tag>);

		expect(screen.getByTestId('badge').getAttribute('data-variant')).toBe(
			'tag',
		);
	});

	it('draws a compact tag without a border', () => {
		render(
			<Tag color="fern" compact>
				Vegetarian
			</Tag>,
		);

		expect(screen.getByTestId('badge').getAttribute('data-variant')).toBe(
			'tag-plain',
		);
	});
});
