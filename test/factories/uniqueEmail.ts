// An email no other call returns, all lowercase, since better-auth rejects a repeated email and stores emails lowercase.
export const uniqueEmail = () => `e2e-${crypto.randomUUID()}@example.com`;
