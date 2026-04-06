import { useDisclosure } from '@mantine/hooks';

type Handlers = {
	enterEditing: () => void;
	exitEditing: () => void;
};

export const useEditMode = (editing: boolean = false): [boolean, Handlers] => {
	const [value, handlers] = useDisclosure(editing);

	return [
		value,
		{
			enterEditing: handlers.open,
			exitEditing: handlers.close,
		},
	];
};
