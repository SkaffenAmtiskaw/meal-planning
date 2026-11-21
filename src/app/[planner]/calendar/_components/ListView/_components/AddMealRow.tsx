import type { ReactElement } from 'react';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface AddMealRowProps {
	onClick: () => void;
}

export function AddMealRow({ onClick }: AddMealRowProps): ReactElement {
	return (
		<Button
			variant="subtle"
			size="sm"
			ml={22}
			w="fit-content"
			leftSection={<IconPlus size={16} />}
			onClick={onClick}
		>
			Add meal
		</Button>
	);
}
