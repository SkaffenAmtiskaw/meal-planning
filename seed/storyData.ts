import { users } from '@/_models/database/users';

import { emailStartingWith, storyEmailPrefix } from './users';

import { readdir } from 'node:fs/promises';

// A story's data file, seed/stories/<story>.ts, exports this. It adds the data one story's checks
// need on top of the generic seed (see docs/seed.md, "Story Data").
export type SeedStory = () => Promise<void>;

const STORIES_DIR = new URL('./stories/', import.meta.url);

const storyNames = async () => {
	try {
		const files = await readdir(STORIES_DIR);
		return files
			.filter((file) => file.endsWith('.ts'))
			.map((file) => file.slice(0, -'.ts'.length))
			.sort();
	} catch {
		// No data files on this branch, so no seed/stories/ folder.
		return [];
	}
};

/**
 * Finds a story's data file without touching the database, so a wrong name stops the seed before
 * it connects. Throws an error listing the story names there are.
 */
export const findStory = async (story: string): Promise<SeedStory> => {
	const names = await storyNames();
	if (!names.includes(story)) {
		const list = names.length > 0 ? names.join(', ') : 'none';
		throw new Error(
			`No story data file seed/stories/${story}.ts. The story names in seed/stories/ are: ${list}.`,
		);
	}

	const { seedStory } = (await import(
		new URL(`${story}.ts`, STORIES_DIR).href
	)) as {
		seedStory?: unknown;
	};
	// Without this, a file missing the export would load nothing and the seed would look as if it
	// worked.
	if (typeof seedStory !== 'function') {
		throw new Error(
			`seed/stories/${story}.ts doesn't export a seedStory function (see docs/seed.md, "Story Data").`,
		);
	}
	return seedStory as SeedStory;
};

// The emails of the users a story's data file created, found by the story's email prefix.
export const storyUserEmails = async (story: string) => {
	const created = await users
		.find({ email: emailStartingWith(storyEmailPrefix(story)) })
		.toArray();
	return created.map(({ email }) => email).sort();
};
