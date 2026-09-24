export const formatSourceChip = (value: string): string => {
	if (value.startsWith('https://')) {
		return value.slice('https://'.length);
	}

	if (value.startsWith('http://')) {
		return value.slice('http://'.length);
	}

	if (value.startsWith('//')) {
		return value.slice(2);
	}

	return value;
};
