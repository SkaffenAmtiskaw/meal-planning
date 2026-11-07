import { MongoClient } from 'mongodb';

// The databases the seed's tools may touch, told apart by name: production is a different database
// on the same Atlas cluster (`staging`), so the name is what keeps them off it.

const MAIN_CHECKOUT_DATABASE = 'test';

// The driver's own parsing of a connection URL, which opens no connection, so a name can be checked
// before anything connects.
export const databaseNameOf = (url: string) =>
	new MongoClient(url).db().databaseName;

// A worktree's slot database, test-1 to test-5 (scripts/worktree-slot.sh assigns them).
export const isWorktreeDatabase = (name: string) => /^test-\d+$/.test(name);

export const isDevDatabase = (name: string) =>
	name === MAIN_CHECKOUT_DATABASE || isWorktreeDatabase(name);
