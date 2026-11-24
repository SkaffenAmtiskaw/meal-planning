import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { SavedResultRow } from './SavedResultRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../SavedItemAction/SavedItemAction', () => ({
	SavedItemAction: vi.fn(() => null),
}));
vi.mock('../SavedItemSummary/SavedItemSummary', () => ({
	SavedItemSummary: vi.fn(() => null),
}));

describe('SavedResultRow', () => {
	it('renders (coverage only, no logic)', () => {
		render(
			<SavedResultRow
				item={{ _id: 'saved-1', name: 'Tacos', kind: 'recipe', tags: [] }}
				added={false}
				onAdd={vi.fn()}
			/>,
		);
	});
});
