import { randomBytes } from "node:crypto";
import { getDatabase } from "@/server/db/mongodb";
import { getActiveProductsByIds } from "@/server/catalog/products";
import type { AuthUser } from "@/server/auth/users";

type OrderStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

type OrderItem = {
  productId: string;
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
};

type OrderRecord = {
  id: string;
  userId: string;
  email: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
};

type OrderEvent = {
  orderId: string;
  type: string;
  actorId: string;
  details?: string;
  createdAt: Date;
};

type OrderMessage = {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: "customer" | "admin";
  body: string;
  createdAt: Date;
};

let indexesPromise: Promise<void> | undefined;

function ensureIndexes() {
  indexesPromise ??= (async () => {
    const database = await getDatabase();
    await Promise.all([
      database.collection<OrderRecord>("orders").createIndex({ id: 1 }, { unique: true }),
      database.collection<OrderRecord>("orders").createIndex({ userId: 1, createdAt: -1 }),
      database.collection<OrderEvent>("order_events").createIndex({ orderId: 1, createdAt: 1 }),
      database.collection<OrderMessage>("order_messages").createIndex({ orderId: 1, createdAt: 1 }),
    ]);
  })().catch((error) => {
    indexesPromise = undefined;
    throw error;
  });
  return indexesPromise;
}

async function collections() {
  const database = await getDatabase();
  await ensureIndexes();
  return {
    orders: database.collection<OrderRecord>("orders"),
    events: database.collection<OrderEvent>("order_events"),
    messages: database.collection<OrderMessage>("order_messages"),
  };
}

export async function recordOrderEvent(orderId: string, type: string, actorId: string, details?: string) {
  const { events } = await collections();
  await events.insertOne({ orderId, type, actorId, details, createdAt: new Date() });
}

export async function createOrder(user: AuthUser, input: { orderId: string; items: { productId: string; quantity: number }[] }) {
  const products = await getActiveProductsByIds([...new Set(input.items.map((item) => item.productId))]);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items: OrderItem[] = input.items.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    if (!product) throw new Error("One or more products are unavailable.");
    if (product.type === "server" && product.available === false) throw new Error("One or more products are not available to order.");
    return { productId, name: product.name, type: product.type, quantity, unitPrice: product.price };
  });
  const now = new Date();
  const { orders, events } = await collections();
  const order: OrderRecord = { id: input.orderId, userId: user.id, email: user.email, items, status: "requested", paymentStatus: "pending", createdAt: now, updatedAt: now };
  await orders.insertOne(order);
  await events.insertOne({ orderId: order.id, type: "order.requested", actorId: user.id, details: "Customer submitted an order request.", createdAt: now });
  return order;
}

export async function markOrderPaid(orderId: string, paymentId: string, amountCents: number) {
  const { orders, events } = await collections();
  const now = new Date();
  const order = await orders.findOne({ id: orderId, status: { $in: ["requested", "accepted"] }, paymentStatus: { $ne: "paid" } });
  if (!order) return false;
  const expectedAmountCents = order.items.reduce((total, item) => total + item.unitPrice * item.quantity * 100, 0);
  if (amountCents !== expectedAmountCents) return false;
  const result = await orders.updateOne({ id: orderId, status: { $in: ["requested", "accepted"] }, paymentStatus: { $ne: "paid" } }, { $set: { paymentStatus: "paid", updatedAt: now } });
  if (result.matchedCount === 0) return false;
  await events.insertOne({ orderId, type: "payment.succeeded", actorId: "payments.lk", details: paymentId, createdAt: now });
  return true;
}

export async function getOrderForUser(orderId: string, userId: string) {
  const { orders, messages } = await collections();
  const order = await orders.findOne({ id: orderId, userId });
  if (!order) return null;
  const orderMessages = await messages.find({ orderId }).sort({ createdAt: 1 }).toArray();
  return { ...order, messages: orderMessages };
}

export async function listOrdersForUser(userId: string) {
  const { orders, messages } = await collections();
  const userOrders = await orders.find({ userId }, { projection: { _id: 0 } }).sort({ updatedAt: -1 }).toArray();
  return Promise.all(userOrders.map(async (order) => {
    const [latestMessage] = await messages.find({ orderId: order.id }).sort({ createdAt: -1 }).limit(1).toArray();
    return {
      ...order,
      latestMessage: latestMessage ? { body: latestMessage.body, createdAt: latestMessage.createdAt } : null,
    };
  }));
}

export async function getOrderForAdmin(orderId: string) {
  const { orders, messages } = await collections();
  const order = await orders.findOne({ id: orderId });
  if (!order) return null;
  const orderMessages = await messages.find({ orderId }).sort({ createdAt: 1 }).toArray();
  return { ...order, messages: orderMessages };
}

export async function canDownloadProduct(orderId: string, userId: string, productId: string) {
  const { orders } = await collections();
  const order = await orders.findOne({ id: orderId, userId, paymentStatus: "paid", items: { $elemMatch: { productId, type: "mod" } } });
  return Boolean(order);
}

export async function listOrders() {
  const { orders } = await collections();
  return orders.find({}).sort({ updatedAt: -1 }).toArray();
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, actorId: string) {
  const { orders, events } = await collections();
  const now = new Date();
  const result = await orders.updateOne({ id: orderId }, { $set: { status, updatedAt: now } });
  if (result.matchedCount === 0) return false;
  await events.insertOne({ orderId, type: `order.${status}`, actorId, createdAt: now });
  return true;
}

export async function addOrderMessage(orderId: string, senderId: string, senderRole: "customer" | "admin", body: string) {
  const { orders, messages, events } = await collections();
  const order = await orders.findOne({ id: orderId });
  if (!order) return null;
  const message: OrderMessage = { id: randomBytes(16).toString("hex"), orderId, senderId, senderRole, body: body.trim(), createdAt: new Date() };
  await messages.insertOne(message);
  await events.insertOne({ orderId, type: "message.created", actorId: senderId, details: senderRole, createdAt: message.createdAt });
  await orders.updateOne({ id: orderId }, { $set: { updatedAt: message.createdAt } });
  return message;
}
