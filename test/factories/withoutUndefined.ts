/** Drops each key whose value is `undefined`, which the MongoDB driver would store as `null`. */
export const withoutUndefined = <T extends object>(overrides: T): T =>
	Object.fromEntries(
		Object.entries(overrides).filter(([, value]) => value !== undefined),
	) as T;
