import { promisify } from "node:util";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { getDatabase } from "@/server/db/mongodb";

const scrypt = promisify(scryptCallback);
const verificationLifetimeMs = 24 * 60 * 60 * 1000;

type UserRecord = {
  id: string;
  email: string;
  firstName?: string;
  country?: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationTokenHash?: string;
  verificationTokenExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUser = Pick<UserRecord, "id" | "email" | "firstName" | "emailVerified">;

export type AdminUser = Pick<UserRecord, "id" | "email" | "firstName" | "country" | "emailVerified" | "createdAt" | "updatedAt">;

function usersCollection() {
  return getDatabase().then((database) => database.collection<UserRecord>("users"));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export function createVerificationToken() {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function findUserByEmail(email: string) {
  const collection = await usersCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(id: string) {
  const collection = await usersCollection();
  return collection.findOne({ id });
}

export async function updateUserProfile(id: string, input: { firstName?: string; country?: string }) {
  const collection = await usersCollection();
  const firstName = input.firstName?.trim().slice(0, 80) || undefined;
  const country = input.country?.trim().slice(0, 80) || undefined;
  await collection.updateOne({ id }, { $set: { firstName, country, updatedAt: new Date() } });
  return findUserById(id);
}

export async function changeUserPassword(id: string, currentPassword: string, newPassword: string) {
  const collection = await usersCollection();
  const user = await collection.findOne({ id });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) return false;
  await collection.updateOne({ id }, { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date() } });
  return true;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const collection = await usersCollection();
  const users = await collection
    .find({}, { projection: { passwordHash: 0, verificationTokenHash: 0, verificationTokenExpiresAt: 0, passwordResetTokenHash: 0, passwordResetTokenExpiresAt: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return users.map(({ id, email, firstName, country, emailVerified, createdAt, updatedAt }) => ({
    id,
    email,
    firstName,
    country,
    emailVerified,
    createdAt,
    updatedAt,
  }));
}

export async function deleteUser(id: string) {
  const database = await getDatabase();
  const result = await database.collection<UserRecord>("users").deleteOne({ id });
  if (result.deletedCount > 0) await database.collection("sessions").deleteMany({ userId: id });
  return result.deletedCount > 0;
}

export async function createUser(input: { email: string; password: string; firstName?: string; country?: string }) {
  const collection = await usersCollection();
  await collection.createIndex({ email: 1 }, { unique: true });

  const now = new Date();
  const verificationToken = createVerificationToken();
  const user: UserRecord = {
    id: randomBytes(16).toString("hex"),
    email: normalizeEmail(input.email),
    firstName: input.firstName?.trim() || undefined,
    country: input.country?.trim() || undefined,
    passwordHash: await hashPassword(input.password),
    emailVerified: false,
    verificationTokenHash: await hashPassword(verificationToken),
    verificationTokenExpiresAt: new Date(now.getTime() + verificationLifetimeMs),
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(user);
  return { user, verificationToken };
}

export async function updateVerificationToken(userId: string) {
  const collection = await usersCollection();
  const verificationToken = createVerificationToken();
  const now = new Date();
  await collection.updateOne(
    { id: userId },
    {
      $set: {
        verificationTokenHash: await hashPassword(verificationToken),
        verificationTokenExpiresAt: new Date(now.getTime() + verificationLifetimeMs),
        updatedAt: now,
      },
    },
  );
  return verificationToken;
}

export async function verifyEmail(token: string) {
  const collection = await usersCollection();
  const users = await collection.find({ emailVerified: false, verificationTokenExpiresAt: { $gt: new Date() } }).toArray();
  for (const user of users) {
    if (user.verificationTokenHash && await verifyPassword(token, user.verificationTokenHash)) {
      await collection.updateOne(
        { id: user.id },
        { $set: { emailVerified: true, updatedAt: new Date() }, $unset: { verificationTokenHash: "", verificationTokenExpiresAt: "" } },
      );
      return true;
    }
  }
  return false;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return user;
}

export async function createPasswordResetToken(email: string) {
  const collection = await usersCollection();
  const user = await collection.findOne({ email: normalizeEmail(email) });
  if (!user) return null;
  const token = createVerificationToken();
  await collection.updateOne(
    { id: user.id },
    { $set: { passwordResetTokenHash: hashToken(token), passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), updatedAt: new Date() } },
  );
  return { user, token };
}

export async function resetPassword(token: string, password: string) {
  const collection = await usersCollection();
  const user = await collection.findOne({ passwordResetTokenHash: hashToken(token), passwordResetTokenExpiresAt: { $gt: new Date() } });
  if (!user) return false;
  await collection.updateOne(
    { id: user.id },
    { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() }, $unset: { passwordResetTokenHash: "", passwordResetTokenExpiresAt: "" } },
  );
  return true;
}
