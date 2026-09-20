import Link from "next/link";

export const metadata = { title: "Terms & Conditions | xoxod33p store" };

export default function TermsPage() {
  return <main className="policy-page"><Link className="back-link" href="/">Back to store</Link><article><span className="section-kicker">Legal</span><h1>Terms & Conditions</h1><p>By using xoxod33p store, you agree to provide accurate account details and use the store for lawful purposes.</p><h2>Orders and services</h2><p>Server hosting, mods, tools, and setup services are supplied as described on each product page. Customers must provide accurate VPS and server access details when a service requires remote setup.</p><h2>Payment and fulfillment</h2><p>Payments are processed through Payments.lk. An order is placed into the fulfillment queue after payment confirmation. Delivery updates and setup instructions are handled through the order chat.</p><h2>Account security</h2><p>You are responsible for keeping your account credentials private. Contact us promptly if you believe your account or order has been accessed without permission.</p><h2>Contact</h2><p>Questions about these terms can be sent to <a href="mailto:support@xoxod33p.store">support@xoxod33p.store</a>.</p></article></main>;
}
