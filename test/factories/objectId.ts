import { Types } from 'mongoose';

// A new ObjectId, for a spec that sets an embedded document's _id itself, since files in e2e/ can't import mongoose.
export const newObjectId = () => new Types.ObjectId();
