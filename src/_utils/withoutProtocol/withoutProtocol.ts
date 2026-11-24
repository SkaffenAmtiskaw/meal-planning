// A URL without its http://, https:// or // prefix, for showing it in a small space.
export const withoutProtocol = (value: string): string => {
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
