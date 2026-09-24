import { PaymentsLk } from "@payments-lk/node";
import { getAppUrl } from "@/lib/env";

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
  const appUrl = getAppUrl();
  return new URL(path, appUrl).toString();
}
