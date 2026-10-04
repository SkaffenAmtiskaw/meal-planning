import { closeDevDatabase, connectDevDatabase } from './devDatabase';

const databaseName = await connectDevDatabase();
console.log(`Connected to the "${databaseName}" database.`);
await closeDevDatabase();
