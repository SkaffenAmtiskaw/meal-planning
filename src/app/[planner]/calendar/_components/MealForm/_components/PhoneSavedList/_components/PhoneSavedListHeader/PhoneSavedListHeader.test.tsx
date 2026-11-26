import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PhoneSavedListHeader } from './PhoneSavedListHeader';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../../SectionLabel/SectionLabel', () => ({
	SectionLabel: vi.fn(({ children }) => <div>{children}</div>),
}));

const clearTags = () => screen.queryByRole('button', { name: 'Clear tags' });

describe('PhoneSavedListHeader', () => {
	it('shows no Clear tags without a way to clear them', () => {
		render(<PhoneSavedListHeader title="From your saved recipes" />);

		expect(clearTags()).toBeNull();
	});

	it('clears the tags from Clear tags', () => {
		const onClearTags = vi.fn();
		render(
			<PhoneSavedListHeader title="Saved · Quick" onClearTags={onClearTags} />,
		);

		fireEvent.click(clearTags() as HTMLElement);

		expect(onClearTags).toHaveBeenCalled();
	});
});
