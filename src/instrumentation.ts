import mongoose from 'mongoose';

import { env } from './env';

export const register = () => {
	mongoose.connect(env.DB_URL);
};
