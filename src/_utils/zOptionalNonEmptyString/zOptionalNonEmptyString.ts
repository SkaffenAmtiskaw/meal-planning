import { z } from 'zod';

/** A string that's either left out or has a value. `.optional()` alone accepts `''`. */
export const zOptionalNonEmptyString = z.string().min(1).optional();
