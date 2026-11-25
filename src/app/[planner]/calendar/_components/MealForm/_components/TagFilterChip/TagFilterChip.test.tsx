import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TagFilterChip } from './TagFilterChip';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const quick = { _id: 'quick', name: 'Quick', color: 'fern' as const };

describe('TagFilterChip', () => {
	it('shows how many results carry an unselected tag', () => {
		render(
			<TagFilterChip option={{ tag: quick, selected: false, count: 2 }} />,
		);

		expect(screen.getByText('2')).toBeDefined();
	});

	it('shows no count on a selected tag', () => {
		render(<TagFilterChip option={{ tag: quick, selected: true }} />);

		expect(screen.queryByTestId('tag-count')).toBeNull();
	});
});
