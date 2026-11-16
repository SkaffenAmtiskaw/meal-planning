// The databases the seed's tools may touch, told apart by name. Production's database, `staging`,
// is on the same Atlas cluster. Local's Atlas user has no role there, and the name check keeps the
// tools off it as well.

const MAIN_CHECKOUT_DATABASE = 'test';

/**
 * A connection URL names its database in the path after its hosts, before any options. With no name, the driver
 * uses `test`, as this does.
 */
export const databaseNameOf = (url: string) => {
	const path = url.replace(/^mongodb(\+srv)?:\/\/[^/]*\/?/, '').split('?')[0];
	return decodeURIComponent(path) || 'test';
};

// A worktree's slot database, test-1 to test-5 (scripts/worktree-slot.sh assigns them).
export const isWorktreeDatabase = (name: string) => /^test-\d+$/.test(name);

export const isDevDatabase = (name: string) =>
	name === MAIN_CHECKOUT_DATABASE || isWorktreeDatabase(name);
