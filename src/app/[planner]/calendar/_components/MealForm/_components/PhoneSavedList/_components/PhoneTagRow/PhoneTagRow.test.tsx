import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTagFilterOption as option } from '#fixtures/tagFilterOption';

import { PhoneTagRow } from './PhoneTagRow';

import { TagChips } from '../../../TagChips/TagChips';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../../TagChips/TagChips', () => ({
	TagChips: vi.fn(() => <div data-testid="chips" />),
}));

const onChange = vi.fn();

const chipsProps = () => vi.mocked(TagChips).mock.lastCall?.[0];

describe('PhoneTagRow', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows nothing when no tag would return anything', () => {
		const { container } = render(
			<PhoneTagRow options={[]} value={[]} onChange={onChange} />,
		);

		expect(container.firstChild).toBeNull();
	});

	it('starts collapsed, and stays expanded as tags are picked and cleared, until toggled back', () => {
		const { rerender } = render(
			<PhoneTagRow
				options={[option('quick')]}
				value={[]}
				onChange={onChange}
			/>,
		);
		expect(chipsProps()?.expanded).toBe(false);

		act(() => chipsProps()?.onToggleExpanded());
		expect(chipsProps()?.expanded).toBe(true);

		// With no options it shows nothing, and the flag outlives that.
		rerender(<PhoneTagRow options={[]} value={['cold']} onChange={onChange} />);
		rerender(
			<PhoneTagRow
				options={[option('quick', true)]}
				value={['quick']}
				onChange={onChange}
			/>,
		);
		rerender(
			<PhoneTagRow
				options={[option('quick')]}
				value={[]}
				onChange={onChange}
			/>,
		);
		expect(chipsProps()?.expanded).toBe(true);

		act(() => chipsProps()?.onToggleExpanded());
		expect(chipsProps()?.expanded).toBe(false);
	});
});
