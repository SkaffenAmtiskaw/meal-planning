import mongoose from 'mongoose';

import { connectDatabase as connectDataModule } from '@/_models/database/connectDatabase';
import { closeDatabase } from '@/_models/database/connection';
import { env } from '@/env';

export const connectDatabase = async () => {
	await Promise.all([mongoose.connect(env.DB_URL), connectDataModule()]);
};

export const disconnectDatabase = async () => {
	await Promise.all([mongoose.disconnect(), closeDatabase()]);
};
