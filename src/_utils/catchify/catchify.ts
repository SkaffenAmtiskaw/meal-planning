type SuccessResult<T> = [T];

type ErrorResult = [undefined, Error];

export const catchify = <T>(
	callback: () => T,
): SuccessResult<T> | ErrorResult => {
	try {
		return [callback()];
	} catch (e) {
		return [undefined, e as Error];
	}
};
