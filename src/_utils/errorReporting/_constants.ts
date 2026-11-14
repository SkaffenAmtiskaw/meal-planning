/** PostHog US Cloud's ingestion host, where events and the relay's requests go. */
export const POSTHOG_HOST = 'https://us.i.posthog.com';

/** PostHog US Cloud's host for the scripts and assets `posthog-js` loads. */
export const POSTHOG_ASSETS_HOST = 'https://us-assets.i.posthog.com';

/** PostHog US Cloud's app, which `posthog-js` links to. */
export const POSTHOG_UI_HOST = 'https://us.posthog.com';

/** The app's own path that relays `posthog-js`'s requests to PostHog. */
export const RELAY_PATH = '/relay';
