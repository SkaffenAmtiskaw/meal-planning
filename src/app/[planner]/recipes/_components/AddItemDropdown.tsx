'use client';

import { Button, Menu } from '@mantine/core';
import { IconBookmark, IconBowlSpoon, IconPlus } from '@tabler/icons-react';

import { usePathname, useRouter } from 'next/navigation';

export const AddItemDropdown = () => {
	const router = useRouter();
	const pathname = usePathname();

	const createURL = (type: 'bookmark' | 'recipe') =>
		`${pathname}?${new URLSearchParams({ status: 'create', type }).toString()}`;

	return (
		<Menu>
			<Menu.Target>
				<Button leftSection={<IconPlus />}>Add Item</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<IconBookmark />}
					onClick={() => router.push(createURL('bookmark'))}
				>
					Bookmark
				</Menu.Item>
				<Menu.Item
					leftSection={<IconBowlSpoon />}
					onClick={() => router.push(createURL('recipe'))}
				>
					Recipe
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
