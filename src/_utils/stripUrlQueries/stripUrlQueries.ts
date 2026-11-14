// An absolute URL up to its query string, then the query string up to a fragment or the URL's end
const URL_QUERY = /([a-z][a-z\d+.-]*:\/\/[^\s?#"'<>]*)\?[^\s#"'<>]*/gi;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	Object.prototype.toString.call(value) === '[object Object]';

/**
 * Removes the query string from every absolute URL in a value, including URLs inside longer strings,
 * and walks arrays and plain objects to do so. Each URL keeps its path and fragment. Other values,
 * such as dates, are returned as they are.
 */
export const stripUrlQueries = <T>(value: T): T => {
	if (typeof value === 'string') {
		return value.replace(URL_QUERY, '$1') as T;
	}
	if (Array.isArray(value)) {
		return value.map(stripUrlQueries) as T;
	}
	if (isPlainObject(value)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => [
				key,
				stripUrlQueries(entry),
			]),
		) as T;
	}
	return value;
};
