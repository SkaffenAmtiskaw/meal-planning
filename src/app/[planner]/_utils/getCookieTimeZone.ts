import 'server-only';

import { cookies } from 'next/headers';

import { IANAZone } from 'luxon';

/**
 * The viewer's time zone, from the `timeZone` cookie the browser saves. Null if
 * the cookie is missing or doesn't hold a valid IANA zone.
 */
export const getCookieTimeZone = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	const timeZone = cookieStore.get('timeZone')?.value;
	return timeZone && IANAZone.isValidZone(timeZone) ? timeZone : null;
};
