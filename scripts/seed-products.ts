import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "xoxod33p-store";

const products = [
  { id: "frontline-20", type: "server", name: "Frontline 20", description: "A ready-to-run public server for weekend warfare.", price: 12000, meta: "20 slots · EU West · NVMe", tag: "Popular", accent: "blue", active: true },
  { id: "frontline-40", type: "server", name: "Frontline 40", description: "More room for clan nights, tournaments, and full lobbies.", price: 22000, meta: "40 slots · EU West · NVMe", accent: "slate", active: true },
  { id: "scrim-elite", type: "server", name: "Scrim Elite", description: "Low-latency private hosting for serious competition.", price: 35000, meta: "24 slots · Frankfurt · Priority", tag: "Premium", accent: "indigo", active: true },
  { id: "winter-crisis", type: "mod", name: "Winter Crisis", description: "A snowbound weapons pack with cinematic map lighting.", price: 8000, meta: "v1.4 · 2.1 GB · All clients", tag: "New", accent: "cyan", active: true },
  { id: "recon-overhaul", type: "mod", name: "Recon Overhaul", description: "Tighter movement, cleaner recoil, and a sharper HUD.", price: 6000, meta: "v2.0 · 640 MB · Multiplayer", accent: "emerald", active: true },
  { id: "urban-ops", type: "mod", name: "Urban Ops map pack", description: "Three close-quarters maps built for fast rotations.", price: 11000, meta: "3 maps · 1.8 GB · Dedicated", accent: "violet", active: true },
  { id: "cod4-vps-install", type: "service", name: "COD4 VPS installation", description: "We install and configure Call of Duty 4 on your VPS, including startup scripts, ports, and a ready-to-run server.", price: 15000, meta: "Remote setup · 1 VPS · COD4", tag: "Setup", accent: "slate", active: true },
  { id: "b3-server-setup", type: "service", name: "B3 admin setup", description: "Battlefield 3 server administration setup with permissions, configuration, and connection to your COD4 server.", price: 10000, meta: "Remote setup · B3 · Admin tools", tag: "Operator", accent: "emerald", active: true },
].map((product) => ({ ...product, createdAt: new Date(), updatedAt: new Date() }));

async function main() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const collection = client.db(databaseName).collection("products");
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.bulkWrite(products.map((product) => ({
      updateOne: { filter: { id: product.id }, update: { $set: product }, upsert: true },
    })));
    console.log(`Seeded ${products.length} products into ${databaseName}.products`);
  } finally {
    await client.close();
  }
}

void main();