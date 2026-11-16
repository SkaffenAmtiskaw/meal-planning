import { ObjectId } from 'mongodb';

/** A new stored id, as the hex string every `_id` and reference to one is stored as. */
export const newId = () => new ObjectId().toHexString();
