/**
 * Deep serialize data to ensure it's a plain JavaScript object.
 * This is necessary when passing data from Server Components/Actions to Client Components
 * to remove any non-serializable properties (like Mongoose ObjectId instances, methods, etc.)
 */
export const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));
