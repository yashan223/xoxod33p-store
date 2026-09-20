import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "xoxod33p-store";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const clientPromise = globalForMongo.mongoClientPromise ?? new MongoClient(uri).connect();

  if (process.env.NODE_ENV !== "production") {
    globalForMongo.mongoClientPromise = clientPromise;
  }

  const client = await clientPromise;
  return client.db(dbName);
}
