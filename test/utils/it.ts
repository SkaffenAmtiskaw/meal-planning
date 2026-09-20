import type { Assertion, TestContext } from 'vitest';
import { it as baseIt } from 'vitest';

const ACCESS_LEVELS = ['read', 'write', 'admin', 'owner'] as const;

type Level = (typeof ACCESS_LEVELS)[number];

type EnhancedAssertion<T> = Assertion<T> & {
	onlyAtLevel: (assertionLevel: Level) => EnhancedAssertion<T>;
	atMinLevel: (assertionLevel: Level) => EnhancedAssertion<T>;
	atMaxLevel: (assertionLevel: Level) => EnhancedAssertion<T>;
};

type CustomExpect = <T>(value: T) => EnhancedAssertion<T>;

type AccessLevelTestContext = Omit<TestContext, 'expect'> & {
	accessLevel: Level;
	expect: CustomExpect;
};

const byAccessLevels = (
	name: string,
	fn: (context: AccessLevelTestContext) => void | Promise<void>,
) => {
	for (const testLevel of ACCESS_LEVELS) {
		baseIt(`${name} - ${testLevel}`, ({ expect, ...context }) => {
			const extendedExpect: CustomExpect = <T>(
				value: T,
			): EnhancedAssertion<T> => {
				const assertion = Object.assign(expect(value), {});

				return Object.assign(assertion, {
					onlyAtLevel: (assertionLevel: Level) =>
						assertionLevel === testLevel ? assertion : assertion.not,
					atMinLevel: (assertionLevel: Level) =>
						ACCESS_LEVELS.indexOf(testLevel) >=
						ACCESS_LEVELS.indexOf(assertionLevel)
							? assertion
							: assertion.not,
					atMaxLevel: (assertionLevel: Level) =>
						ACCESS_LEVELS.indexOf(testLevel) <=
						ACCESS_LEVELS.indexOf(assertionLevel)
							? assertion
							: assertion.not,
				}) as unknown as EnhancedAssertion<T>;
			};

			fn({ ...context, accessLevel: testLevel, expect: extendedExpect });
		});
	}
};

export const it = Object.assign(baseIt, { byAccessLevels });
