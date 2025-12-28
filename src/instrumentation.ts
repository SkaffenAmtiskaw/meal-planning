import mongoose from 'mongoose';

export const register = () => {
	// biome-ignore lint/style/noNonNullAssertion: mandatory environment variable
	mongoose.connect(process.env.DB_URL!);
};
