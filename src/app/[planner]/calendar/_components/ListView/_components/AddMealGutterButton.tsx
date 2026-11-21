import type { ReactElement } from 'react';

import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import styles from './AddMealGutterButton.module.css';

interface AddMealGutterButtonProps {
	onClick: () => void;
}

export function AddMealGutterButton({
	onClick,
}: AddMealGutterButtonProps): ReactElement {
	return (
		<ActionIcon
			className={styles.button}
			variant="subtle"
			size={22}
			radius="xl"
			onClick={onClick}
		>
			<IconPlus size={14} />
		</ActionIcon>
	);
}
