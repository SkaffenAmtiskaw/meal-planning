import { z } from 'zod';

const SAFE_STRING_REGEX = /^[a-zA-Z0-9 '.,-]+$/;

export const zSafeString = (maxLength = 50) =>
	z
		.string()
		.min(1, 'Must be at least 1 character')
		.max(maxLength, `Must be ${maxLength} characters or fewer`)
		.regex(SAFE_STRING_REGEX, 'Contains invalid characters');
