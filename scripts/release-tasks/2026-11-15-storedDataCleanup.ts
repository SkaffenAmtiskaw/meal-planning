// Release task for Stored Data Cleanup: moves the stored planners and users to the clean shape. It:
// - gives an `_id` to every calendar meal and dish that has none,
// - unsets every `null` meal `description`, dish `note` and dish `source`,
// - unsets every `""` saved-item `notes` and recipe `storage`,
// - gives an `_id` to every user planner membership that has none.
// It runs after the release PR merges. No code of the story handles the old shape: it ships with the release task
// that converts stored ids to strings, which leaves the app down until it has run, so this task runs straight after
// the deploy too, before anyone uses the app. So deleting this task leaves no code to remove.
// It selects only fields still in the old shape, so a second run changes nothing. See docs/release_tasks.md.
// Usage: node scripts/release-tasks/2026-11-15-storedDataCleanup.ts --to <connection string> [--db <database>]
//          [--production | --dry-run | --check]
//   --to           the server holding the database, as a connection string whose user can write to it
//   --db           the database to change. Defaults to staging, production's database.
//   --production   required to write to staging
//   --dry-run      prints what it would change and writes nothing
//   --check        counts what's still in the old shape, and writes nothing. After the task, expect every count at 0:
//                  meals, dishes and memberships without an `_id`, days with one, and each `null` or `""` field.

import { parseArgs } from 'node:util';

import { type Db, type Document, ObjectId } from 'mongodb';

import { openDatabase } from '../../src/_models/database/openDatabase.ts';

const PRODUCTION_DB = 'staging';

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
		'Usage: node scripts/release-tasks/2026-11-15-storedDataCleanup.ts --to <connection string> [--db <database>] [--production | --dry-run | --check]',
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
	console.error(`storedDataCleanup: ${message}`);
	process.exit(1);
}

async function migrate(db: Db, dryRun: boolean) {
	const counts = {
		'meals to give an _id': 0,
		'dishes to give an _id': 0,
		'meal descriptions to unset (null)': 0,
		'dish notes to unset (null)': 0,
		'dish sources to unset (null)': 0,
		'saved-item notes to unset ("")': 0,
		'recipe storages to unset ("")': 0,
		'memberships to give an _id': 0,
	};
	const updates: { collection: string; filter: Document; update: Document }[] =
		[];

	const planners = db
		.collection('planners')
		.find({}, { projection: { calendar: 1, saved: 1 } });
	for await (const planner of planners) {
		const set: Document = {};
		const unset: Document = {};
		planner.calendar?.forEach((day: Document, d: number) => {
			day.meals?.forEach((meal: Document, m: number) => {
				const mealPath = `calendar.${d}.meals.${m}`;
				if (meal._id === undefined) {
					set[`${mealPath}._id`] = new ObjectId();
					counts['meals to give an _id']++;
				}
				if (meal.description === null) {
					unset[`${mealPath}.description`] = '';
					counts['meal descriptions to unset (null)']++;
				}
				meal.dishes?.forEach((dish: Document, i: number) => {
					const dishPath = `${mealPath}.dishes.${i}`;
					if (dish._id === undefined) {
						set[`${dishPath}._id`] = new ObjectId();
						counts['dishes to give an _id']++;
					}
					if (dish.note === null) {
						unset[`${dishPath}.note`] = '';
						counts['dish notes to unset (null)']++;
					}
					if (dish.source === null) {
						unset[`${dishPath}.source`] = '';
						counts['dish sources to unset (null)']++;
					}
				});
			});
		});
		planner.saved?.forEach((item: Document, s: number) => {
			if (item.notes === '') {
				unset[`saved.${s}.notes`] = '';
				counts['saved-item notes to unset ("")']++;
			}
			if (item.storage === '') {
				unset[`saved.${s}.storage`] = '';
				counts['recipe storages to unset ("")']++;
			}
		});
		addUpdate('planners', planner, ['calendar', 'saved'], set, unset);
	}

	const users = db
		.collection('users')
		.find({}, { projection: { planners: 1 } });
	for await (const user of users) {
		const set: Document = {};
		user.planners?.forEach((membership: Document, p: number) => {
			if (membership._id === undefined) {
				set[`planners.${p}._id`] = new ObjectId();
				counts['memberships to give an _id']++;
			}
		});
		addUpdate('users', user, ['planners'], set, {});
	}

	console.log(
		`storedDataCleanup: ${dryRun ? 'would change' : 'changing'}, in ${db.databaseName}:`,
	);
	for (const [label, count] of Object.entries(counts)) {
		console.log(`  ${count} ${label}`);
	}
	if (dryRun) {
		console.log(
			`storedDataCleanup: dry run, nothing written to ${db.databaseName}`,
		);
		return;
	}

	let skipped = 0;
	for (const { collection, filter, update } of updates) {
		const result = await db.collection(collection).updateOne(filter, update);
		if (result.modifiedCount === 0) {
			console.error(
				`storedDataCleanup: ${collection} ${filter._id} changed while the task ran, so it was left alone`,
			);
			skipped++;
		}
	}
	if (skipped > 0) {
		fail(
			`${skipped} document(s) were left alone. Run the task again to change them.`,
		);
	}
	console.log(
		`storedDataCleanup: wrote ${updates.length} document(s) in ${db.databaseName}`,
	);

	// The paths name array positions, so the filter matches the arrays as they were read. If someone edits the
	// document in between, a position may point at another element, and the update matches nothing.
	function addUpdate(
		collection: string,
		doc: Document,
		arrays: string[],
		set: Document,
		unset: Document,
	) {
		if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
			return;
		}
		const filter: Document = { _id: doc._id };
		for (const array of arrays) {
			filter[array] = doc[array] ?? { $exists: false };
		}
		const update: Document = {};
		if (Object.keys(set).length > 0) update.$set = set;
		if (Object.keys(unset).length > 0) update.$unset = unset;
		updates.push({ collection, filter, update });
	}
}

// Counts with aggregations rather than the task's own walk, so a mistake in the walk doesn't hide itself.
async function runCheck(db: Db) {
	const planners = db.collection('planners');
	const days = [{ $unwind: '$calendar' }];
	const meals = [...days, { $unwind: '$calendar.meals' }];
	const dishes = [...meals, { $unwind: '$calendar.meals.dishes' }];
	const saved = [{ $unwind: '$saved' }];
	const checks: [string, Document[], ReturnType<Db['collection']>][] = [
		[
			'days with an _id',
			[...days, { $match: { 'calendar._id': { $exists: true } } }],
			planners,
		],
		[
			'meals without an _id',
			[...meals, { $match: { 'calendar.meals._id': { $exists: false } } }],
			planners,
		],
		[
			'dishes without an _id',
			[
				...dishes,
				{ $match: { 'calendar.meals.dishes._id': { $exists: false } } },
			],
			planners,
		],
		[
			'null meal descriptions',
			[
				...meals,
				{ $match: { 'calendar.meals.description': { $type: 'null' } } },
			],
			planners,
		],
		[
			'null dish notes',
			[
				...dishes,
				{ $match: { 'calendar.meals.dishes.note': { $type: 'null' } } },
			],
			planners,
		],
		[
			'null dish sources',
			[
				...dishes,
				{ $match: { 'calendar.meals.dishes.source': { $type: 'null' } } },
			],
			planners,
		],
		[
			'"" saved-item notes',
			[...saved, { $match: { 'saved.notes': '' } }],
			planners,
		],
		[
			'"" recipe storages',
			[...saved, { $match: { 'saved.storage': '' } }],
			planners,
		],
		[
			'memberships without an _id',
			[
				{ $unwind: '$planners' },
				{ $match: { 'planners._id': { $exists: false } } },
			],
			db.collection('users'),
		],
	];
	for (const [label, pipeline, collection] of checks) {
		const [result] = await collection
			.aggregate([...pipeline, { $count: 'count' }])
			.toArray();
		console.log(`storedDataCleanup: ${result?.count ?? 0} ${label}`);
	}
}
