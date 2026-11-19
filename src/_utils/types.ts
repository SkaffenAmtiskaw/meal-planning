// Takes a single property on an object and makes it optional.
export type Optionalize<T extends {}, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>;
