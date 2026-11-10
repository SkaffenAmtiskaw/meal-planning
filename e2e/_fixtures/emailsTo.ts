export type Email = {
	from: string;
	to: string | string[];
	subject: string;
	html: string;
};

// Every email the app has sent to the recipient so far, oldest first, as the fake Resend server kept it.
export const emailsTo = async (recipient: string): Promise<Email[]> => {
	const url = new URL('/emails', process.env.RESEND_BASE_URL);
	url.searchParams.set('to', recipient);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`The fake Resend server answered ${response.status}`);
	}
	return response.json();
};
