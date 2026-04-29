'use client';

import { useState } from 'react';

import { Combobox, Pill, PillsInput, Text, useCombobox } from '@mantine/core';

import { addTag } from '@/_actions/planner/addTag';
import { TAG_COLORS, type TagColor } from '@/_theme/colors';
import { catchify } from '@/_utils/catchify';

export interface TagOption {
	_id: string;
	name: string;
	color: string;
}

interface Props {
	plannerId: string;
	initialTags: TagOption[];
	value: string[];
	onChange: (value: string[]) => void;
	label?: string;
}

export const TagCombobox = ({
	plannerId,
	initialTags,
	value,
	onChange,
	label,
}: Props) => {
	const [availableTags, setAvailableTags] = useState<TagOption[]>(initialTags);
	const [search, setSearch] = useState('');
	const [createError, setCreateError] = useState<string | null>(null);

	const getPillStyle = (color: string) => {
		const tagColor = TAG_COLORS[color as TagColor];
		if (tagColor) {
			return {
				backgroundColor: tagColor.bg,
				color: tagColor.text,
				border: `1px solid ${tagColor.border}`,
			};
		}
		return { backgroundColor: color };
	};

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	const selectedTags = availableTags.filter((t) => value.includes(t._id));
	const filteredOptions = availableTags.filter(
		(t) =>
			!value.includes(t._id) &&
			t.name.toLowerCase().includes(search.toLowerCase().trim()),
	);

	const exactMatch = availableTags.some(
		(t) => t.name.toLowerCase() === search.toLowerCase().trim(),
	);
	const showCreate = search.trim().length > 0 && !exactMatch;

	const handleSelect = (tagId: string) => {
		onChange([...value, tagId]);
		setSearch('');
		combobox.closeDropdown();
	};

	const handleCreate = async () => {
		const name = search.trim();
		const [result, error] = await catchify(() => addTag(plannerId, name));
		if (error || !result) {
			setCreateError('Failed to create tag');
			return;
		}
		if (!result.ok) {
			setCreateError(result.error);
			return;
		}
		setAvailableTags((prev) => [...prev, result.data]);
		onChange([...value, result.data._id]);
		setSearch('');
		combobox.closeDropdown();
		setCreateError(null);
	};

	const handleRemove = (tagId: string) => {
		onChange(value.filter((id) => id !== tagId));
	};

	const pills = selectedTags.map((tag) => (
		<Pill
			key={tag._id}
			withRemoveButton
			onRemove={() => handleRemove(tag._id)}
			style={getPillStyle(tag.color)}
		>
			{tag.name}
		</Pill>
	));

	return (
		<>
			<Combobox
				store={combobox}
				onOptionSubmit={(val) => {
					if (val === '__create__') {
						handleCreate();
					} else {
						handleSelect(val);
					}
				}}
			>
				<Combobox.DropdownTarget>
					<PillsInput label={label} onClick={() => combobox.openDropdown()}>
						<Pill.Group>
							{pills}
							<PillsInput.Field
								value={search}
								placeholder="Search or create tags"
								onChange={(e) => {
									setSearch(e.currentTarget.value);
									combobox.openDropdown();
									combobox.updateSelectedOptionIndex();
								}}
								onFocus={() => combobox.openDropdown()}
								onBlur={() => combobox.closeDropdown()}
								onKeyDown={(e) => {
									if (
										e.key === 'Backspace' &&
										search.length === 0 &&
										value.length > 0
									) {
										onChange(value.slice(0, -1));
									}
								}}
							/>
						</Pill.Group>
					</PillsInput>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown>
					<Combobox.Options>
						{showCreate && (
							<Combobox.Option value="__create__">
								+ Create &ldquo;{search.trim()}&rdquo;
							</Combobox.Option>
						)}
						{filteredOptions.length > 0
							? filteredOptions.map((tag) => (
									<Combobox.Option key={tag._id} value={tag._id}>
										{tag.name}
									</Combobox.Option>
								))
							: !showCreate && <Combobox.Empty>No tags found</Combobox.Empty>}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
			{createError && (
				<Text c="red" data-testid="tag-create-error" size="xs">
					{createError}
				</Text>
			)}
		</>
	);
};
