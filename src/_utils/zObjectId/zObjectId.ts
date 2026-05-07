import type { Types } from 'mongoose';
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const zObjectId = z.custom<Types.ObjectId>(
	(value: unknown) => typeof value === 'string' && objectIdRegex.test(value),
	{ message: 'ObjectId is invalid' },
);
