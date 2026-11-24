import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { PhoneSavedList } from './PhoneSavedList';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { phoneListRows } from '../../_utils/phoneListRows';
import { AddAsNewDishRow } from '../AddAsNewDishRow/AddAsNewDishRow';
import { PhoneSavedResultRow } from '../PhoneSavedResultRow/PhoneSavedResultRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock('../../_utils/phoneListRows', () => ({
	phoneListRows: vi.fn(() => []),
}));
vi.mock('../../_utils/phoneListTitle', () => ({
	phoneListTitle: vi.fn(() => 'From your saved recipes'),
}));
vi.mock('../SectionLabel/SectionLabel', () => ({
	SectionLabel: vi.fn(({ children }) => <div>{children}</div>),
}));
vi.mock('../PhoneSavedResultRow/PhoneSavedResultRow', () => ({
	PhoneSavedResultRow: vi.fn(() => null),
}));
vi.mock('../AddAsNewDishRow/AddAsNewDishRow', () => ({
	AddAsNewDishRow: vi.fn(() => <div data-testid="add-as-new" />),
}));

const item = (name: string): SavedItem => ({
	_id: name,
	name,
	kind: 'recipe',
	tags: [],
});
const tacos = item('Black Bean Tacos');
const oats = item('Overnight Oats');

const props = {
	search: '',
	linkedIds: new Set<string>(),
	fieldNode: null,
	onUse: vi.fn(),
	onClose: vi.fn(),
};

const title = () => screen.queryByText('From your saved recipes');
const addAsNew = () => screen.queryByTestId('add-as-new');

describe('PhoneSavedList', () => {
	// The list renders again once its ref is set, so each test's rows hold across renders.
	beforeEach(() => {
		vi.mocked(phoneListRows).mockReturnValue([]);
		vi.mocked(PhoneSavedResultRow).mockClear();
	});

	it('lists the rows with their title, and marks the ones already on the meal', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos, oats]);
		vi.mocked(phoneListRows).mockReturnValue([tacos, oats]);
		render(
			<PhoneSavedList {...props} linkedIds={new Set(['Overnight Oats'])} />,
		);

		expect(title()).not.toBeNull();
		expect(vi.mocked(PhoneSavedResultRow)).toHaveBeenCalledWith(
			expect.objectContaining({ item: tacos, added: false }),
			undefined,
		);
		expect(vi.mocked(PhoneSavedResultRow)).toHaveBeenCalledWith(
			expect.objectContaining({ item: oats, added: true }),
			undefined,
		);
	});

	it('uses the tapped recipe', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		render(<PhoneSavedList {...props} />);

		vi.mocked(PhoneSavedResultRow).mock.calls[0][0].onUse();

		expect(props.onUse).toHaveBeenCalledWith(tacos);
	});

	it('closes the list from its last row, keeping what was typed', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		render(<PhoneSavedList {...props} search="Soup" />);

		vi.mocked(AddAsNewDishRow).mock.lastCall?.[0].onAdd();

		expect(props.onClose).toHaveBeenCalled();
	});

	it('shows only the last row, untitled, when nothing matches', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		render(<PhoneSavedList {...props} search="zzz" />);

		expect(title()).toBeNull();
		expect(addAsNew()).not.toBeNull();
	});
});
