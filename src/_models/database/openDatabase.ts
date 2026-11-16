import { MongoClient } from 'mongodb';

/**
 * Opens a raw handle on a database at a given URI, for a tool that works below the schemas on a server other than
 * the app's, such as a release task or the restore test. It imports only packages, so a script run with plain
 * `node` can import it by its relative path.
 */
export const openDatabase = async (uri: string, name?: string) => {
	const client = await MongoClient.connect(uri);
	return { database: client.db(name), close: () => client.close() };
};
