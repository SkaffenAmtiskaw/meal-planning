import { Combobox, Pill, useCombobox } from '@mantine/core';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addTag } from '@/_actions/library';
import { TAG_COLORS } from '@/_theme/colors';

import { TagCombobox } from './TagCombobox';

vi.mock('@/_theme/colors', () => ({
	TAG_COLORS: {
		fern: {
			bg: 'rgb(228, 242, 228)',
			text: 'rgb(30, 77, 30)',
			border: 'rgb(135, 194, 135)',
		},
		red: {
			bg: 'rgb(240, 100, 100)',
			text: 'rgb(120, 20, 20)',
			border: 'rgb(200, 80, 80)',
		},
		blue: {
			bg: 'rgb(200, 220, 250)',
			text: 'rgb(20, 40, 120)',
			border: 'rgb(100, 140, 200)',
		},
	},
	TagColor: 'fern',
}));

vi.mock('@/_actions/library', () => ({
	addTag: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn((fn: () => Promise<unknown>) => {
		return fn()
			.then((result) => [result, null])
			.catch((error) => [null, error]);
	}),
}));

const defaultProps = {
	plannerId: 'planner-123',
	initialTags: [
		{ _id: 'tag-1', name: 'Spicy', color: 'red' },
		{ _id: 'tag-2', name: 'Sweet', color: 'blue' },
	],
	value: [] as string[],
	onChange: vi.fn(),
};

const getOnOptionSubmit = () => {
	const latestCall = vi.mocked(Combobox).mock.calls.at(-1);
	return latestCall?.[0].onOptionSubmit as ((val: string) => void) | undefined;
};

describe('TagCombobox', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('shows empty state when no options match search', () => {
		render(<TagCombobox {...defaultProps} value={['tag-1', 'tag-2']} />);
		expect(screen.getByTestId('empty')).toBeDefined();
	});

	test('calls onChange with tag added when an option is selected', () => {
		const onChange = vi.fn();
		render(<TagCombobox {...defaultProps} onChange={onChange} />);

		const onOptionSubmit = getOnOptionSubmit();
		onOptionSubmit?.('tag-1');

		expect(onChange).toHaveBeenCalledWith(['tag-1']);
	});

	test('calls onChange with tag removed when a pill remove is clicked', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox {...defaultProps} value={['tag-1']} onChange={onChange} />,
		);
		fireEvent.click(screen.getByTestId('pill-remove'));
		expect(onChange).toHaveBeenCalledWith([]);
	});

	test('calls onChange without last tag on Backspace when search is empty', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox
				{...defaultProps}
				value={['tag-1', 'tag-2']}
				onChange={onChange}
			/>,
		);
		const input = screen.getByTestId('tag-input');
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(onChange).toHaveBeenCalledWith(['tag-1']);
	});

	test('opens dropdown on input focus and closes on blur', () => {
		render(<TagCombobox {...defaultProps} />);

		// useCombobox was called during render, get the returned object
		const comboboxResult = vi.mocked(useCombobox).mock.results[0].value;

		const input = screen.getByTestId('tag-input');
		fireEvent.focus(input);
		expect(comboboxResult.openDropdown).toHaveBeenCalled();
		fireEvent.blur(input);
		expect(comboboxResult.closeDropdown).toHaveBeenCalled();
	});

	test('does not remove tag on Backspace when search has content', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox {...defaultProps} value={['tag-1']} onChange={onChange} />,
		);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'abc' } });
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(onChange).not.toHaveBeenCalled();
	});

	test('shows create option when search does not match any tag exactly', () => {
		render(<TagCombobox {...defaultProps} />);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'New Tag' } });
		expect(screen.getByTestId('option-__create__')).toBeDefined();
	});

	test('does not show create option when search exactly matches an existing tag', () => {
		render(<TagCombobox {...defaultProps} />);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'Spicy' } });
		expect(screen.queryByTestId('option-__create__')).toBeNull();
	});

	test('creates a new tag and adds it to selection on __create__ submit', async () => {
		const onChange = vi.fn();
		const newTag = { _id: 'tag-3', name: 'Umami', color: 'green' };
		vi.mocked(addTag).mockResolvedValue({ ok: true, data: newTag });

		render(<TagCombobox {...defaultProps} onChange={onChange} />);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'Umami' } });

		const onOptionSubmit = getOnOptionSubmit();
		await act(async () => {
			onOptionSubmit?.('__create__');
		});

		expect(addTag).toHaveBeenCalledWith('planner-123', 'Umami');
		expect(onChange).toHaveBeenCalledWith(['tag-3']);
	});

	test('shows error message when addTag returns an error result', async () => {
		vi.mocked(addTag).mockResolvedValue({ ok: false, error: 'Unauthorized' });

		render(<TagCombobox {...defaultProps} />);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'Fail' } });

		const onOptionSubmit = getOnOptionSubmit();
		await act(async () => {
			onOptionSubmit?.('__create__');
		});

		expect(screen.getByTestId('tag-create-error')).toBeDefined();
	});

	test('shows error message when addTag throws unexpectedly', async () => {
		vi.mocked(addTag).mockRejectedValue(new Error('Network failure'));

		render(<TagCombobox {...defaultProps} />);
		const input = screen.getByTestId('tag-input');
		fireEvent.change(input, { target: { value: 'Fail' } });

		const onOptionSubmit = getOnOptionSubmit();
		await act(async () => {
			onOptionSubmit?.('__create__');
		});

		expect(screen.getByTestId('tag-create-error')).toBeDefined();
	});

	test('passes TAG_COLORS style for known tag colors', () => {
		render(
			<TagCombobox
				{...defaultProps}
				initialTags={[{ _id: 'tag-fern', name: 'Fern', color: 'fern' }]}
				value={['tag-fern']}
			/>,
		);
		expect(Pill).toHaveBeenCalledWith(
			expect.objectContaining({
				style: expect.objectContaining({
					backgroundColor: TAG_COLORS.fern.bg,
					color: TAG_COLORS.fern.text,
					border: `1px solid ${TAG_COLORS.fern.border}`,
				}),
			}),
			undefined,
		);
	});

	test('passes fallback background style for unknown color', () => {
		render(
			<TagCombobox
				{...defaultProps}
				initialTags={[{ _id: 'tag-x', name: 'Custom', color: 'turquoise' }]}
				value={['tag-x']}
			/>,
		);
		expect(Pill).toHaveBeenCalledWith(
			expect.objectContaining({
				style: expect.objectContaining({
					backgroundColor: 'turquoise',
				}),
			}),
			undefined,
		);
	});
});
