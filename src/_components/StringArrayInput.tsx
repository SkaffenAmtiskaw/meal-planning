'use client';

import {
	ActionIcon,
	Button,
	Group,
	Input,
	Stack,
	TextInput,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface Props {
	value: string[];
	onChange: (value: string[]) => void;
	label?: string;
	placeholder?: string;
}

export const StringArrayInput = ({
	value,
	onChange,
	label,
	placeholder,
}: Props) => {
	const handleChange = (index: number, text: string) => {
		const next = [...value];
		next[index] = text;
		onChange(next);
	};

	const handleRemove = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const handleAdd = () => {
		onChange([...value, '']);
	};

	return (
		<Stack gap="xs">
			{label && <Input.Label>{label}</Input.Label>}
			{value.map((item, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: order is stable for string arrays
				<Group key={index} gap="xs">
					<TextInput
						flex={1}
						value={item}
						placeholder={placeholder}
						onChange={(e) => handleChange(index, e.currentTarget.value)}
					/>
					<ActionIcon
						variant="subtle"
						color="red"
						onClick={() => handleRemove(index)}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			))}
			<Button
				variant="subtle"
				leftSection={<IconPlus size={16} />}
				onClick={handleAdd}
			>
				Add
			</Button>
		</Stack>
	);
};
