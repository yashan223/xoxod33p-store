import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageCheck, Server, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveProductById } from "@/server/catalog/products";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-LK")}`;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getActiveProductById(id);
  if (!product) return <div className="product-not-found"><h1>Product not found</h1><Link href="/">Back to store</Link></div>;

  const isService = product.type === "service";
  return (
    <main className="product-detail-page"><header className="product-detail-header"><Link className="brand" href="/"><span className="brand-mark">X</span><span><strong>xoxod33p store</strong><small>COD4 servers & mods</small></span></Link><Link className="back-link" href="/"><ArrowLeft size={15} /> Back to store</Link></header><div className="product-detail-layout"><div className={`product-detail-visual product-art-${product.accent}`}><span className="product-art-label">{product.type === "server" ? "SERVER" : isService ? "SERVICE" : "MOD PACK"}</span><div className="product-art-symbol">{product.type === "server" ? <Server size={78} strokeWidth={1.2} /> : isService ? <Wrench size={78} strokeWidth={1.2} /> : <PackageCheck size={78} strokeWidth={1.2} />}</div></div><article className="product-detail-copy"><Badge>{product.tag ?? (product.type === "server" ? "Game server" : isService ? "Setup service" : "Mod or tool")}</Badge><h1>{product.name}</h1><p>{product.description}</p><div className="product-detail-spec"><span>Specifications</span><strong>{product.meta}</strong></div><div className="product-detail-buy"><div><span>{product.type === "server" ? "Monthly hosting" : isService ? "One-time setup" : "One-time download"}</span><strong>{formatPrice(product.price)}</strong></div><Button disabled> Add to cart <ArrowRight size={16} /></Button></div><small className="detail-note">Sign in before ordering to save this purchase to your account. Payments are handled securely by Payments.lk.</small></article></div></main>
  );
}
