import type { AccessLevel } from '@/_models/user';

export const getAccessLevelColor = (accessLevel: AccessLevel): string => {
	switch (accessLevel) {
		case 'owner':
			return 'red';
		case 'admin':
			return 'orange';
		case 'write':
			return 'blue';
		case 'read':
			return 'gray';
	}
};
