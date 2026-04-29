import type { AccessLevel } from '@/_models/user';

export const getAvailableAccessLevels = (
	viewerIsOwner: boolean,
): AccessLevel[] => {
	if (viewerIsOwner) {
		return ['admin', 'write', 'read'];
	}
	// Admin can only assign write/read
	return ['write', 'read'];
};
