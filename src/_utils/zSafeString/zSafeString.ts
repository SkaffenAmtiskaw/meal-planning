import { z } from 'zod';

const SAFE_STRING_REGEX = /^[a-zA-Z0-9 '.,-]+$/;

export const zSafeString = (maxLength = 50) =>
	z
		.string()
		.min(1, { error: 'Must be at least 1 character' })
		.max(maxLength, { error: `Must be ${maxLength} characters or fewer` })
		.regex(SAFE_STRING_REGEX, { error: 'Contains invalid characters' });
