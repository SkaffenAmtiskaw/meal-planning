'use client';

import { useState } from 'react';

import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';

import { z } from 'zod';

import { addBookmark, editBookmark } from '@/_actions/library';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback } from '@/_hooks';
import type { BookmarkInterface } from '@/_models/types';

import { TagCombobox } from '../TagCombobox';
import type { TagOption } from '../types';

const zFormFields = z.object({
	name: z.string().min(1, { error: 'Name is required' }),
	url: z.url({ error: 'URL is required' }),
	notes: z.string().optional(),
});

type Props = {
	plannerId: string;
	tags: TagOption[];
	item?: BookmarkInterface;
	onCancel: () => void;
	onSuccess: () => void;
};

export const BookmarkForm = ({
	item,
	plannerId,
	tags,
	onCancel,
	onSuccess,
}: Props) => {
	const [selectedTags, setSelectedTags] = useState<string[]>(item?.tags ?? []);

	const { status, countdown, errorMessage, wrap } = useFormFeedback();

	const form = useForm({
		mode: 'uncontrolled',
		validate: schemaResolver(zFormFields),
		initialValues: {
			name: item?.name ?? '',
			url: item?.url ?? '',
			notes: item?.notes ?? '',
		},
	});

	const handleSubmit = form.onSubmit(
		wrap(async (values) => {
			const payload = { ...values, tags: selectedTags, plannerId };

			if (item) {
				return editBookmark({ ...payload, _id: item._id });
			}

			return addBookmark(payload);
		}, onSuccess),
	);

	return (
		<form onSubmit={handleSubmit} data-testid="bookmark-form">
			<Stack>
				<FormFeedbackAlert status={status} errorMessage={errorMessage} />
				<TextInput
					label="Name"
					key={form.key('name')}
					withAsterisk
					{...form.getInputProps('name')}
				/>
				<TextInput
					label="URL"
					key={form.key('url')}
					withAsterisk
					{...form.getInputProps('url')}
				/>
				<Textarea
					label="Notes"
					key={form.key('notes')}
					{...form.getInputProps('notes')}
				/>
				<TagCombobox
					label="Tags"
					plannerId={plannerId}
					tags={tags}
					value={selectedTags}
					onChange={setSelectedTags}
				/>
				<Group justify="flex-end">
					<Button variant="subtle" onClick={onCancel}>
						Cancel
					</Button>
					<SubmitButton
						status={status}
						countdown={countdown}
						label={item ? 'Save' : 'Add Bookmark'}
					/>
				</Group>
			</Stack>
		</form>
	);
};
