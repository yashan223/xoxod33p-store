"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Menu, PackageCheck, Search, Server, ShoppingBag, Trash2, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PixelBlast from "@/components/PixelBlast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const categories = [
  { id: "all", label: "All products" },
  { id: "server", label: "Game servers" },
  { id: "mod", label: "Mods & tools" },
  { id: "service", label: "Services" },
];

const faqItems = [
  { question: "How quickly will my server be ready?", answer: "Most server plans are prepared within one business day. Your operator will send the connection details and next steps after checkout." },
  { question: "Are the mod packs compatible with my server?", answer: "Each product lists its version and client requirements. If you are unsure, contact support before purchasing and we will help you choose." },
  { question: "How does payment work?", answer: "Checkout is handled securely by Payments.lk in Sri Lankan rupees. We never store your card details." },
  { question: "Can I get help after purchasing?", answer: "Yes. Every purchase includes operator support for setup, configuration, and getting your community online." },
];

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-LK")}`;
}

export function Storefront({ products, currentUser }: { products: Product[]; currentUser: { email: string; firstName?: string } | null }) {
  const router = useRouter();
  const checkoutReference = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "all" || product.type === category;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.description} ${product.meta}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const cartProducts = products.filter((product) => cart.includes(product.id));
  const cartTotal = cartProducts.reduce((total, product) => total + product.price, 0);

  function addToCart(productId: string) {
    setCart((currentCart) => currentCart.includes(productId) ? currentCart : [...currentCart, productId]);
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) => currentCart.filter((id) => id !== productId));
  }

  async function startCheckout() {
    if (cartProducts.length === 0 || checkoutState === "loading") return;
    setCheckoutState("loading");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: `loadout-${checkoutReference}`, items: cartProducts.map((product) => ({ productId: product.id, quantity: 1 })) }),
      });
      const result = (await response.json()) as { orderId?: string; error?: string };
      if (!response.ok || !result.orderId) throw new Error(result.error ?? "Request unavailable");
      window.location.assign(`/orders/${result.orderId}`);
    } catch {
      setCheckoutState("error");
    }
  }

  return (
    <main className="store-shell">
      <header className={cn("site-header", isScrolled && "site-header-scrolled")} id="storefront">
        <a className="brand" href="#storefront" aria-label="xoxod33p store home"><Image src="/logo.png" alt="xoxod33p store" className="brand-logo" width={120} height={30} /></a>
        <nav className={cn("site-nav", isMenuOpen && "site-nav-open")} aria-label="Main navigation"><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a><a className="active" href="#catalog" onClick={() => setIsMenuOpen(false)}>Shop</a><a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></nav>
        <div className="header-actions">{currentUser ? <Link className="ui-button ui-button-ghost sign-in-button" href="/dashboard">Dashboard</Link> : <Link className="ui-button ui-button-ghost sign-in-button" href="/sign-in">Sign in</Link>}<Button variant="outline" className="cart-button" onClick={() => setIsCartOpen(true)}><ShoppingBag size={17} /> Cart <span>{cart.length}</span></Button>{currentUser && <form action="/api/auth/sign-out" method="post"><button className="ui-button ui-button-ghost sign-in-button" type="submit">Sign out</button></form>}<Button variant="ghost" size="icon" className="menu-button" onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</Button></div>
      </header>

      <section className="brand-intro" id="home" aria-label="Welcome to xoxod33p store">
        <div className="intro-pixel-blast" aria-hidden="true">
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#000000"
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent
            edgeFade={0.5}
          />
        </div>
        <div className="brand-intro-content">
          <Image src="/logo.png" alt="xoxod33p store" className="intro-logo" width={560} height={150} priority />
          <p>Build your ideal COD4 experience with reliable servers, battle-tested mods, and support that keeps your community in the game.</p>
          <a className="intro-enter" href="#storefront">Explore the store <ArrowRight size={16} /></a>
        </div>
        <span className="intro-corner intro-corner-left">BUILT IN SRI LANKA / FOR PLAYERS EVERYWHERE</span>
        <span className="intro-corner intro-corner-right">SERVERS / MODS / SUPPORT</span>
      </section>

      <section className="catalog-section" id="catalog"><div className="section-heading"><div><p className="section-kicker">Shop the collection</p><h2>Find your Products</h2></div></div><div className="catalog-toolbar"><div className="category-tabs" role="tablist" aria-label="Product categories">{categories.map((item) => <button className={cn(category === item.id && "selected")} key={item.id} onClick={() => setCategory(item.id)} role="tab" aria-selected={category === item.id} type="button">{item.label}</button>)}</div><label className="search-field"><Search size={16} /><Input type="search" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div><div className="product-grid">{visibleProducts.map((product) => { const inCart = cart.includes(product.id); const isService = product.type === "service"; return <Card className="product-card" key={product.id} onClick={() => router.push(`/products/${product.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") router.push(`/products/${product.id}`); }} role="link" tabIndex={0}><div className={cn("product-art", `product-art-${product.accent}`)}><span className="product-art-label">{product.type === "server" ? "SERVER" : product.type === "service" ? "SERVICE" : "MOD PACK"}</span><div className="product-art-symbol">{product.type === "server" ? <Server size={42} strokeWidth={1.4} /> : product.type === "service" ? <Wrench size={42} strokeWidth={1.4} /> : <PackageCheck size={42} strokeWidth={1.4} />}</div>{product.tag && <Badge>{product.tag}</Badge>}</div><CardContent><div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><div className="product-meta"><strong>{formatPrice(product.price)}<small>{product.type === "server" ? " / month" : isService ? " one-time setup" : " one-time"}</small></strong></div></div><Button variant={inCart ? "secondary" : "outline"} className="add-button" onClick={(event) => { event.stopPropagation(); addToCart(product.id); }}>{inCart ? <><Check size={15} /> Added</> : <>Add to cart <ArrowRight size={15} /></>}</Button></CardContent></Card>; })}</div>{visibleProducts.length === 0 && <p className="empty-state">No products match your search.</p>}</section>

      <section className="faq-section" id="faq"><div className="faq-heading"><p className="section-kicker">Quick answers</p><h2>Everything you need<br />before game time.</h2></div><div className="faq-list">{faqItems.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>

      <footer className="site-footer" id="contact"><div className="footer-top"><div className="footer-brand"><Image src="/logo.png" alt="xoxod33p store" className="footer-logo" width={160} height={34} /></div></div><div className="footer-links"><div><span>Store</span><a href="#catalog">All products</a><a href="#catalog">Game servers</a><a href="#catalog">Mods & tools</a></div><div><span>Company</span><a href="#faq">FAQ</a><a href="#contact">Contact</a></div><div><span>Legal</span><Link href="/terms">Terms & Conditions</Link><Link href="/refund-policy">No Refund Policy</Link></div><div><span>Contact</span><a href="mailto:support@xoxod33p.store">support@xoxod33p.store</a><a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">WhatsApp: +94 77 123 4567</a><small>Response within one business day.</small></div></div><div className="footer-bottom"><span>© 2026 xoxod33p store. Built for better game nights.</span><span className="footer-code">SERVERS / MODS / SUPPORT</span></div></footer>

      {isCartOpen && <div className="cart-overlay" role="presentation" onClick={() => setIsCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="section-kicker">Your selection</p><h2>Shopping cart</h2></div><Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} aria-label="Close shopping cart"><X size={20} /></Button></div>{cartProducts.length === 0 ? <div className="drawer-empty"><ShoppingBag size={30} /><p>Your cart is empty.</p><span>Add a server, tool, or service to get started.</span></div> : <div className="drawer-items">{cartProducts.map((product) => <div className="drawer-item" key={product.id}><div><strong>{product.name}</strong><span>{product.type === "server" ? "Game server" : product.type === "service" ? "Setup service" : "Mod or tool"}</span></div><div><b>{formatPrice(product.price)}</b><Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`}><Trash2 size={15} /></Button></div></div>)}</div>}<div className="drawer-footer"><div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div><Button className="checkout-button" disabled={cartProducts.length === 0 || checkoutState === "loading"} onClick={startCheckout}>{checkoutState === "loading" ? "Submitting request..." : "Request server"}<ArrowRight size={16} /></Button><small>{checkoutState === "error" ? "Unable to submit your request. Please try again." : "An operator will review your request before payment."}</small></div></aside></div>}
    </main>
  );
}
