import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MouseEvent } from 'react';

import { Group } from '@mantine/core';

import { SavedResultRow } from './SavedResultRow';
import classes from './SavedResultRow.module.css';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../SavedItemAction/SavedItemAction', () => ({
	SavedItemAction: vi.fn(() => null),
}));
vi.mock('../SavedItemSummary/SavedItemSummary', () => ({
	SavedItemSummary: vi.fn(() => null),
}));

const renderRow = (highlighted: boolean, onHover = vi.fn()) =>
	render(
		<SavedResultRow
			item={{ _id: 'saved-1', name: 'Tacos', kind: 'recipe', tags: [] }}
			added={false}
			linking={false}
			highlighted={highlighted}
			onPick={vi.fn()}
			onHover={onHover}
		/>,
	);

const rowProps = () => vi.mocked(Group).mock.lastCall?.[0] ?? {};

describe('SavedResultRow', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([
		true,
		false,
	])('shows the highlight only on the highlighted row (highlighted: %s)', (highlighted) => {
		renderRow(highlighted);

		expect(String(rowProps().className).includes(classes.highlighted)).toBe(
			highlighted,
		);
	});

	it('reports the mouse moving over it', () => {
		const onHover = vi.fn();
		renderRow(false, onHover);

		rowProps().onMouseMove?.({} as MouseEvent<HTMLDivElement>);

		expect(onHover).toHaveBeenCalled();
	});
});
