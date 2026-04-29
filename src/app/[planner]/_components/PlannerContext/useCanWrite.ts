import { usePlannerContext } from './usePlannerContext';

export const useCanWrite = (): boolean => {
	const { accessLevel } = usePlannerContext();
	return (
		accessLevel === 'write' ||
		accessLevel === 'admin' ||
		accessLevel === 'owner'
	);
};
