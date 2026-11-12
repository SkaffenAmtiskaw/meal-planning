import { MongoClient } from 'mongodb';

// The databases the seed's tools may touch, told apart by name. Production's database, `staging`,
// is on the same Atlas cluster. Local's Atlas user has no role there, and the name check keeps the
// tools off it as well.

const MAIN_CHECKOUT_DATABASE = 'test';

// The driver's own parsing of a connection URL, which opens no connection, so a name can be checked
// before anything connects.
export const databaseNameOf = (url: string) =>
	new MongoClient(url).db().databaseName;

// A worktree's slot database, test-1 to test-5 (scripts/worktree-slot.sh assigns them).
export const isWorktreeDatabase = (name: string) => /^test-\d+$/.test(name);

export const isDevDatabase = (name: string) =>
	name === MAIN_CHECKOUT_DATABASE || isWorktreeDatabase(name);
