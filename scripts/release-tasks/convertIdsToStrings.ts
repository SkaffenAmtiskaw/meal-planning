// Release task for Drop Mongoose: rewrites every ObjectId in the app's own collections as its hex string, so the
// stored data matches the schemas, whose ids are strings, and planner URLs keep working. It:
// - writes each planner, user and pending invite again under its id as a string, since `_id` can't change in place,
// - converts every id and reference inside them: saved items and their tag ids, tags, meals, dishes and a dish's
//   saved-item `source`, user memberships and their `planner`, and an invite's `planner` and `invitedBy`,
// - unsets `__v`, the version key Mongoose added, on every planner, user and pending invite.
// better-auth's own collections (`user`, `account`, `session`, `verification`) keep their ObjectIds.
// It runs after the release PR merges, straight after the deploy, and after storedDataCleanup.ts, whose new meal,
// dish and membership ids it converts. No code of the story reads the old shape, as an exception to the parallel
// change in docs/release_tasks.md: Sarah accepted that production's code can't match the stored ObjectIds, so the app
// is down from the deploy until this task has run. So deleting this task leaves no code to remove.
// It also runs on the main checkout's `test` database straight after the story's PR merges, since local runs on
// `develop` use it: `--db test`, a dry run, the run, then `--check`.
// It changes only documents that still hold an ObjectId or `__v`, so a second run changes nothing.
// See docs/release_tasks.md.
// Usage: node scripts/release-tasks/convertIdsToStrings.ts --to <connection string> [--db <database>]
//          [--production | --dry-run | --check]
//   --to           the server holding the database, as a connection string whose user can write to it
//   --db           the database to change. Defaults to staging, production's database.
//   --production   required to write to staging
//   --dry-run      prints what it would change and writes nothing
//   --check        counts what's still in the old shape, and writes nothing. After the task, expect every count at 0:
//                  each id or reference that's still an ObjectId, and each document with `__v`.

import { parseArgs } from 'node:util';

import { type Db, type Document, ObjectId } from 'mongodb';

import { openDatabase } from '../../src/_models/database/openDatabase.ts';

const PRODUCTION_DB = 'staging';
const COLLECTIONS = ['planners', 'users', 'pendinginvites'];

const { values } = parseArgs({
	options: {
		to: { type: 'string' },
		db: { type: 'string', default: PRODUCTION_DB },
		production: { type: 'boolean', default: false },
		'dry-run': { type: 'boolean', default: false },
		check: { type: 'boolean', default: false },
	},
});
const { to, db: databaseName, production, check } = values;
const dryRun = values['dry-run'];

if (!to) {
	fail(
		'Usage: node scripts/release-tasks/convertIdsToStrings.ts --to <connection string> [--db <database>] [--production | --dry-run | --check]',
	);
}
if (production && databaseName !== PRODUCTION_DB) {
	fail(`--production writes only to ${PRODUCTION_DB}, not ${databaseName}`);
}
if (production && (dryRun || check)) {
	fail('--production writes, so it goes without --dry-run or --check');
}
if (databaseName === PRODUCTION_DB && !production && !dryRun && !check) {
	fail(
		`${PRODUCTION_DB} is production's database. Pass --production to write to it, or --dry-run to see what would change.`,
	);
}

const { database, close } = await openDatabase(to, databaseName);
try {
	if (check) {
		await runCheck(database);
	} else {
		await migrate(database, dryRun);
	}
} finally {
	await close();
}

function fail(message: string): never {
	console.error(`convertIdsToStrings: ${message}`);
	process.exit(1);
}

async function migrate(db: Db, dryRun: boolean) {
	// Counts each converted ObjectId by its path, with array positions left out, such as `planners.saved.tags`.
	const counts = new Map<string, number>();
	let countedInDocument = 0;
	const count = (label: string) => {
		counts.set(label, (counts.get(label) ?? 0) + 1);
		countedInDocument++;
	};
	const changes: { collection: string; old: Document; converted: Document }[] =
		[];

	for (const collection of COLLECTIONS) {
		for await (const doc of db.collection(collection).find({})) {
			countedInDocument = 0;
			const converted = convert(doc, collection, count);
			if ('__v' in converted) {
				delete converted.__v;
				count(`${collection} __v to unset`);
			}
			if (countedInDocument > 0) {
				changes.push({ collection, old: doc, converted });
			}
		}
	}

	console.log(
		`convertIdsToStrings: ${dryRun ? 'would change' : 'changing'}, in ${db.databaseName}:`,
	);
	for (const [label, n] of [...counts].sort(([a], [b]) => a.localeCompare(b))) {
		console.log(`  ${n} ${label}`);
	}
	console.log(`  ${changes.length} document(s) in all`);
	if (dryRun) {
		console.log(
			`convertIdsToStrings: dry run, nothing written to ${db.databaseName}`,
		);
		return;
	}

	for (const { collection, old, converted } of changes) {
		await write(db, collection, old, converted);
	}
	console.log(
		`convertIdsToStrings: wrote ${changes.length} document(s) in ${db.databaseName}`,
	);
}

// Returns a copy with every ObjectId as its hex string, counting each under its path.
function convert(
	value: unknown,
	path: string,
	count: (label: string) => void,
): Document {
	if (value instanceof ObjectId) {
		count(path);
		return value.toHexString() as unknown as Document;
	}
	if (Array.isArray(value)) {
		return value.map((item) => convert(item, path, count)) as Document;
	}
	if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				convert(item, `${path}.${key}`, count),
			]),
		);
	}
	return value as Document;
}

// A document under a new `_id` is a new document, so the old one is deleted first, since users' unique email index
// would refuse a copy beside it. If the insert fails, the old one goes back before the task stops.
async function write(
	db: Db,
	collection: string,
	old: Document,
	converted: Document,
) {
	const documents = db.collection(collection);
	if (!(old._id instanceof ObjectId)) {
		await documents.replaceOne({ _id: old._id }, converted);
		return;
	}
	await documents.deleteOne({ _id: old._id });
	try {
		await documents.insertOne(converted);
	} catch (error) {
		await documents.insertOne(old);
		fail(
			`${collection} ${old._id} couldn't be written under its new id, so it was put back as it was: ${error}`,
		);
	}
}

// Counts with aggregations on each listed path rather than the task's own walk, so a mistake in the walk doesn't hide
// itself.
async function runCheck(db: Db) {
	const objectId = { $type: 'objectId' };
	const checks: [string, string, Document[]][] = [
		['planners', '_id', [{ $match: { _id: objectId } }]],
		[
			'planners',
			'saved._id',
			[{ $unwind: '$saved' }, { $match: { 'saved._id': objectId } }],
		],
		[
			'planners',
			'saved.tags',
			[
				{ $unwind: '$saved' },
				{ $unwind: '$saved.tags' },
				{ $match: { 'saved.tags': objectId } },
			],
		],
		[
			'planners',
			'tags._id',
			[{ $unwind: '$tags' }, { $match: { 'tags._id': objectId } }],
		],
		[
			'planners',
			'calendar.meals._id',
			[
				{ $unwind: '$calendar' },
				{ $unwind: '$calendar.meals' },
				{ $match: { 'calendar.meals._id': objectId } },
			],
		],
		[
			'planners',
			'calendar.meals.dishes._id',
			[
				{ $unwind: '$calendar' },
				{ $unwind: '$calendar.meals' },
				{ $unwind: '$calendar.meals.dishes' },
				{ $match: { 'calendar.meals.dishes._id': objectId } },
			],
		],
		[
			'planners',
			'calendar.meals.dishes.source',
			[
				{ $unwind: '$calendar' },
				{ $unwind: '$calendar.meals' },
				{ $unwind: '$calendar.meals.dishes' },
				{ $match: { 'calendar.meals.dishes.source': objectId } },
			],
		],
		['users', '_id', [{ $match: { _id: objectId } }]],
		[
			'users',
			'planners._id',
			[{ $unwind: '$planners' }, { $match: { 'planners._id': objectId } }],
		],
		[
			'users',
			'planners.planner',
			[{ $unwind: '$planners' }, { $match: { 'planners.planner': objectId } }],
		],
		['pendinginvites', '_id', [{ $match: { _id: objectId } }]],
		['pendinginvites', 'planner', [{ $match: { planner: objectId } }]],
		['pendinginvites', 'invitedBy', [{ $match: { invitedBy: objectId } }]],
	];
	for (const [collection, path, pipeline] of checks) {
		const [result] = await db
			.collection(collection)
			.aggregate([...pipeline, { $count: 'count' }])
			.toArray();
		console.log(
			`convertIdsToStrings: ${result?.count ?? 0} ObjectIds at ${collection} ${path}`,
		);
	}
	for (const collection of COLLECTIONS) {
		const n = await db
			.collection(collection)
			.countDocuments({ __v: { $exists: true } });
		console.log(`convertIdsToStrings: ${n} ${collection} documents with __v`);
	}
}
