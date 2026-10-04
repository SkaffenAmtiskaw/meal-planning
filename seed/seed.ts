import 'temporal-polyfill/global';

import { Types } from 'mongoose';

import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';
import type { DayInterface } from '@/_models/calendar';
import type { BookmarkInterface, RecipeInterface } from '@/_models/library';

import { closeDevDatabase, connectDevDatabase } from './devDatabase';
import { resetSeed } from './reset';
import { DEV_PASSWORD, SEEDED_USERS } from './users';

const tagIds = {
	quick: new Types.ObjectId(),
	vegetarian: new Types.ObjectId(),
	familyFavorite: new Types.ObjectId(),
};

// Colors in the order the app's addTag assigns them.
const tags = [
	{ _id: tagIds.quick, name: 'Quick', color: 'tangerine' as const },
	{ _id: tagIds.vegetarian, name: 'Vegetarian', color: 'rosewood' as const },
	{
		_id: tagIds.familyFavorite,
		name: 'Family Favorite',
		color: 'honey' as const,
	},
];

const recipeIds = {
	chicken: new Types.ObjectId(),
	tacos: new Types.ObjectId(),
	risotto: new Types.ObjectId(),
	oats: new Types.ObjectId(),
};

const recipes: RecipeInterface[] = [
	{
		_id: recipeIds.chicken,
		name: 'Lemon Herb Chicken',
		ingredients: [
			'4 chicken thighs',
			'1 lemon',
			'2 cloves garlic',
			'1 tbsp chopped rosemary',
			'2 tbsp olive oil',
			'Salt and pepper',
		],
		instructions: [
			'Heat the oven to 425°F.',
			'Mix the lemon juice, garlic, rosemary and olive oil.',
			'Coat the chicken and season with salt and pepper.',
			'Roast for 25 minutes, until cooked through.',
		],
		servings: 4,
		tags: [tagIds.familyFavorite],
		time: { prep: '15 min', cook: '25 min', total: '40 min' },
	},
	{
		_id: recipeIds.tacos,
		name: 'Black Bean Tacos',
		ingredients: [
			'2 cans black beans',
			'1 tsp cumin',
			'8 corn tortillas',
			'1 avocado',
			'Salsa',
		],
		instructions: [
			'Warm the beans with the cumin and mash lightly.',
			'Heat the tortillas.',
			'Fill with beans, sliced avocado and salsa.',
		],
		servings: 4,
		tags: [tagIds.quick, tagIds.vegetarian],
		time: { prep: '10 min', cook: '10 min', total: '20 min' },
	},
	{
		_id: recipeIds.risotto,
		name: 'Mushroom Risotto',
		ingredients: [
			'1 1/2 cups arborio rice',
			'8 oz mushrooms',
			'1 onion',
			'5 cups vegetable stock',
			'1/2 cup parmesan',
		],
		instructions: [
			'Cook the onion and mushrooms until soft.',
			'Stir in the rice for a minute.',
			'Add the stock a ladle at a time, stirring until absorbed.',
			'Stir in the parmesan.',
		],
		servings: 4,
		tags: [tagIds.vegetarian],
		time: { prep: '10 min', cook: '35 min', total: '45 min' },
	},
	{
		_id: recipeIds.oats,
		name: 'Overnight Oats',
		ingredients: [
			'1 cup rolled oats',
			'1 cup milk',
			'1/2 cup yogurt',
			'Berries',
		],
		instructions: [
			'Mix the oats, milk and yogurt in a jar.',
			'Refrigerate overnight.',
			'Top with berries.',
		],
		servings: 2,
		time: { prep: '5 min', total: '8 hr' },
	},
];

const bookmarks: BookmarkInterface[] = [
	{
		_id: new Types.ObjectId(),
		name: 'Weeknight Pasta Ideas',
		url: 'https://example.com/weeknight-pasta',
		tags: [tagIds.quick],
	},
	{
		_id: new Types.ObjectId(),
		name: 'Sheet Pan Dinners',
		url: 'https://example.com/sheet-pan-dinners',
		tags: [],
	},
];

type Meals = NonNullable<DayInterface['meals']>;

// Indexed by day of the week, Sunday first, as the calendar's weeks run.
const weeklyMeals: Meals[] = [
	[
		{
			name: 'Brunch',
			dishes: [{ name: 'Pancakes' }, { name: 'Fruit Salad' }],
		},
		{
			name: 'Dinner',
			dishes: [
				{ name: 'Lemon Herb Chicken', source: recipeIds.chicken },
				{ name: 'Roasted Vegetables' },
			],
		},
	],
	[
		{
			name: 'Dinner',
			dishes: [{ name: 'Black Bean Tacos', source: recipeIds.tacos }],
		},
	],
	[{ name: 'Dinner', dishes: [{ name: 'Spaghetti Bolognese' }] }],
	[],
	[
		{
			name: 'Dinner',
			dishes: [
				{ name: 'Mushroom Risotto', source: recipeIds.risotto },
				{ name: 'Green Salad' },
			],
		},
	],
	[
		{ name: 'Lunch', dishes: [{ name: 'Leftovers' }] },
		{ name: 'Dinner', dishes: [{ name: 'Homemade Pizza' }] },
	],
	[
		{
			name: 'Breakfast',
			dishes: [{ name: 'Overnight Oats', source: recipeIds.oats }],
		},
	],
];

// Whole weeks from the start of last week through next month's first full week,
// so the range covers the current week and a month boundary whatever day it runs.
const today = Temporal.Now.plainDateISO();
const firstDay = today.subtract({ days: (today.dayOfWeek % 7) + 7 });
const nextMonthStart = today.with({ day: 1 }).add({ months: 1 });
const nextMonthFirstSunday = nextMonthStart.add({
	days: (7 - (nextMonthStart.dayOfWeek % 7)) % 7,
});
const lastDay = nextMonthFirstSunday.add({ days: 6 });

const calendar: DayInterface[] = [];
for (
	let date = firstDay;
	Temporal.PlainDate.compare(date, lastDay) <= 0;
	date = date.add({ days: 1 })
) {
	const meals = weeklyMeals[date.dayOfWeek % 7];
	if (meals.length > 0) calendar.push({ date: date.toString(), meals });
}

await connectDevDatabase();
await resetSeed();

const sharedPlanner = await createPlanner({
	name: 'Seeded Shared Planner',
	tags,
	saved: [...recipes, ...bookmarks],
	calendar,
});

for (const { name, email, accessLevel } of SEEDED_USERS) {
	const [firstName] = name.split(' ');
	const personalPlanner = await createPlanner({
		name: `${firstName}'s Planner`,
	});

	await createUser({
		email,
		name,
		password: DEV_PASSWORD,
		// The shared planner comes first, so the home page lands them there.
		planners: [
			{ planner: sharedPlanner._id, accessLevel },
			{ planner: personalPlanner._id, accessLevel: 'owner' },
		],
	});
}

await closeDevDatabase();

const nameWidth = Math.max(...SEEDED_USERS.map(({ name }) => name.length));
const levelWidth = Math.max(
	...SEEDED_USERS.map(({ accessLevel }) => accessLevel.length),
);

console.log(`Seeded users (password: ${DEV_PASSWORD}):`);
for (const { name, email, accessLevel } of SEEDED_USERS) {
	console.log(
		`  ${accessLevel.padEnd(levelWidth)}  ${name.padEnd(nameWidth)}  ${email}`,
	);
}
