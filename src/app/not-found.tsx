import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="product-not-found">
      <span className="section-kicker">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or is no longer available.</p>
      <Link href="/">Back to store</Link>
    </main>
  );
}
