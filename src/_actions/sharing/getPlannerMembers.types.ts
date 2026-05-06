import type { AccessLevel } from '@/_models/user';

export interface PlannerMember {
	name: string;
	email: string;
	accessLevel: AccessLevel;
}
