import { MongoMemoryServer } from 'mongodb-memory-server';

const server = await MongoMemoryServer.create();

console.log(`Memory server ready at ${server.getUri()}`);
