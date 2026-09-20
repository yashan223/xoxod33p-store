import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PackageCheck, Server, ShoppingBag, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/server/auth/session";
import { getActiveProductById } from "@/server/catalog/products";
import { ProductAddToCart } from "@/components/store/product-add-to-cart";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-LK")}`;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getActiveProductById(id);
  if (!product) return <div className="product-not-found"><h1>Product not found</h1><Link href="/">Back to store</Link></div>;

  const isService = product.type === "service";
  const currentUser = await getCurrentUser();
  return (
    <main className="product-detail-page"><header className="product-detail-header"><Link className="product-detail-brand" href="/"><Image src="/logo.png" alt="xoxod33p store" width={120} height={30} style={{ height: "auto" }} /></Link><nav className="product-detail-nav" aria-label="Main navigation"><Link href="/#home">Home</Link><Link href="/#catalog">Shop</Link><Link href="/#faq">FAQ</Link><Link href="/#contact">Contact</Link></nav><div className="product-detail-actions">{currentUser ? <Link href="/dashboard">Dashboard</Link> : <Link href="/sign-in">Sign in</Link>}<Link className="product-detail-cart ui-button ui-button-default" href="/?cart=1#catalog"><ShoppingBag size={17} /> Cart</Link><Link className="back-link" href="/"><ArrowLeft size={15} /> Back to store</Link></div></header><div className="product-detail-layout"><div className={`product-detail-visual product-art-${product.accent}`}><span className="product-art-label">{product.type === "server" ? "SERVER" : isService ? "SERVICE" : "MOD PACK"}</span><div className="product-art-symbol">{product.type === "server" ? <Server size={78} strokeWidth={1.2} /> : isService ? <Wrench size={78} strokeWidth={1.2} /> : <PackageCheck size={78} strokeWidth={1.2} />}</div></div><article className="product-detail-copy"><Badge>{product.tag ?? (product.type === "server" ? "Game server" : isService ? "Setup service" : "Mod or tool")}</Badge><h1>{product.name}</h1><p>{product.description}</p><div className="product-detail-spec"><span>Specifications</span><strong>{product.meta}</strong></div><div className="product-detail-buy"><div><span>{product.type === "server" ? "Monthly hosting" : isService ? "One-time setup" : "One-time download"}</span><strong>{formatPrice(product.price)}</strong></div><ProductAddToCart product={product} /></div><small className="detail-note">Sign in before ordering to save this purchase to your account. Payments are handled securely by Payments.lk.</small></article></div></main>
  );
}
