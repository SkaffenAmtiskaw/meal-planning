type SuccessResult<T> = [T];

type ErrorResult = [undefined, Error];

export const catchify = async <T>(
	callback: () => Promise<T>,
): Promise<SuccessResult<T> | ErrorResult> => {
	try {
		return [await callback()];
	} catch (e) {
		return [undefined, e as Error];
	}
};
