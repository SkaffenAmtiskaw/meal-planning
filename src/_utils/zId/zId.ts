import { z } from 'zod';

const idRegex = /^[0-9a-fA-F]{24}$/;

/** The shape of an id: the 24-character hex string the data module's `newId` gives out. It doesn't check that anything has that id. */
export const zId = z.string().regex(idRegex, { error: 'Id is invalid' });
