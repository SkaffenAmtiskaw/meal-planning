/** The message `getUser` throws when the request has no session. */
export const NO_SESSION_MESSAGE = 'No Valid Session';

/** Whether a caught error is `getUser`'s no-session error, an expected outcome that isn't reported. */
export const isNoSessionError = (error: unknown) =>
	error instanceof Error && error.message === NO_SESSION_MESSAGE;
