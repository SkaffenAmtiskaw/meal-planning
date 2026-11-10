import type { Email } from './emailsTo';

// The link in an email's HTML. Each email the app sends holds one.
export const linkInEmail = (email: Email) => {
	const href = email.html.match(/<a href="([^"]+)"/)?.[1];
	if (!href) throw new Error(`No link in the email "${email.subject}"`);
	return href;
};
