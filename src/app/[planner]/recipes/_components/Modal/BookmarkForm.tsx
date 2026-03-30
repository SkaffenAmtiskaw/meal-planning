'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { addBookmark } from '@/_actions/saved/addBookmark';
import { editBookmark } from '@/_actions/saved/editBookmark';
import type { TagOption } from '@/_components';
import { FormFeedbackAlert, SubmitButton, TagCombobox } from '@/_components';
import { useFormFeedback } from '@/_hooks';
import type { BookmarkInterface } from '@/_models/planner/bookmark.types';

const zFormFields = z.object({
	name: z.string().min(1, 'Name is required'),
	url: z.url('URL is required'),
});

type Props = {
	plannerId: string;
	tags: TagOption[];
	item?: BookmarkInterface;
};

export const BookmarkForm = ({ item, plannerId, tags }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	const [selectedTags, setSelectedTags] = useState<string[]>(
		item?.tags?.map(String) ?? [],
	);

	const { status, countdown, errorMessage, wrap } = useFormFeedback();

	const form = useForm({
		mode: 'uncontrolled',
		validate: zod4Resolver(zFormFields),
		initialValues: {
			name: item?.name ?? '',
			url: item?.url ?? '',
		},
	});

	const handleSubmit = form.onSubmit(
		wrap(
			async (values) => {
				const payload = { ...values, tags: selectedTags, plannerId };

				if (item) {
					return editBookmark({ ...payload, _id: String(item._id) });
				}

				return addBookmark(payload);
			},
			() => router.push(pathname),
		),
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
				<TagCombobox
					label="Tags"
					plannerId={plannerId}
					initialTags={tags}
					value={selectedTags}
					onChange={setSelectedTags}
				/>
				<Group justify="flex-end">
					<Button variant="subtle" onClick={() => router.push(pathname)}>
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
