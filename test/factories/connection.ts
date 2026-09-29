import mongoose from 'mongoose';

import { env } from '@/env';

export const connectDatabase = async () => {
	await mongoose.connect(env.DB_URL);
};

export const disconnectDatabase = async () => {
	await mongoose.disconnect();
};
