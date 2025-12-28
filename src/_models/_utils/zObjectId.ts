import { Types } from 'mongoose';
import { z } from 'zod';

const isString = (v: unknown): v is string => typeof v === 'string';

export const zObjectId = z.custom<Types.ObjectId>(
	(value: unknown) => isString(value) && Types.ObjectId.isValid(value),
	{ message: 'ObjectId is invalid' },
);
