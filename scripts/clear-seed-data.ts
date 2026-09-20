import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "xoxod33p-store";
const seededProductIds = [
  "frontline-20",
  "frontline-40",
  "scrim-elite",
  "winter-crisis",
  "recon-overhaul",
  "urban-ops",
  "cod4-vps-install",
  "b3-server-setup",
];

async function main() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const result = await client
      .db(databaseName)
      .collection("products")
      .deleteMany({ id: { $in: seededProductIds } });

    console.log(`Cleared ${result.deletedCount} seeded products from ${databaseName}.products`);
  } finally {
    await client.close();
  }
}

void main();