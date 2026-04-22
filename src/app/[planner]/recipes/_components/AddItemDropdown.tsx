'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Button, Menu } from '@mantine/core';
import { IconBookmark, IconBowlSpoon, IconPlus } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

export const AddItemDropdown = () => {
	const canWrite = useCanWrite();
	const router = useRouter();
	const pathname = usePathname();

	if (!canWrite) {
		return null;
	}

	const createURL = (type: 'bookmark' | 'recipe') =>
		`${pathname}?${new URLSearchParams({ status: 'add', type }).toString()}`;

	return (
		<Menu>
			<Menu.Target>
				<Button leftSection={<IconPlus />} variant="cta">
					Add Item
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					data-testid="add-bookmark"
					leftSection={<IconBookmark />}
					onClick={() => router.push(createURL('bookmark'))}
				>
					Bookmark
				</Menu.Item>
				<Menu.Item
					data-testid="add-recipe"
					leftSection={<IconBowlSpoon />}
					onClick={() => router.push(createURL('recipe'))}
				>
					Recipe
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
