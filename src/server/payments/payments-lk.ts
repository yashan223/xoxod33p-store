import { PaymentsLk } from "@payments-lk/node";

let client: PaymentsLk | undefined;

export function getPaymentsLkClient() {
  const secretKey = process.env.PAYMENTS_LK_SECRET_KEY;

  if (!secretKey || secretKey === "sk_test_replace_me") {
    throw new Error("PAYMENTS_LK_SECRET_KEY is not configured.");
  }

  client ??= new PaymentsLk(secretKey);
  return client;
}

export function getPaymentsReturnUrl(path: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, appUrl).toString();
}
