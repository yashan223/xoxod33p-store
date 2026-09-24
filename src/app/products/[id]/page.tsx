import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PackageCheck, Server, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/server/auth/session";
import { getActiveProductById } from "@/server/catalog/products";
import { CartButton } from "@/components/store/cart-button";
import { ProductAddToCart } from "@/components/store/product-add-to-cart";
import { absoluteUrl, siteName } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const getProduct = cache(getActiveProductById);

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-LK")}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };

  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      url: `/products/${product.id}`,
      title: `${product.name} | ${siteName}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const isService = product.type === "service";
  const currentUser = await getCurrentUser();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    category:
      product.type === "server"
        ? "Game server hosting"
        : isService
          ? "Setup service"
          : "Game mods and tools",
    image: [product.imageUrl ? absoluteUrl(product.imageUrl) : absoluteUrl("/logo.png")],
    brand: { "@type": "Brand", name: siteName },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.id}`),
      priceCurrency: "LKR",
      price: product.price,
      availability:
        product.type === "server" && product.available === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <main className="product-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="site-header site-header-scrolled">
        <Link className="brand" href="/" aria-label="xoxod33p store home">
          <Image
            src="/logo.png"
            alt="xoxod33p store"
            className="brand-logo"
            width={120}
            height={30}
            style={{ height: "auto" }}
          />
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/#home">Home</Link>
          <Link href="/#catalog">Shop</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          {currentUser ? (
            <Link className="ui-button ui-button-ghost sign-in-button" href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <Link className="ui-button ui-button-ghost sign-in-button" href="/sign-in">
              Sign in
            </Link>
          )}
          <CartButton />
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> Back to store
          </Link>
        </div>
      </header>
      <div className="product-detail-layout">
        <div className={`product-detail-visual product-art-${product.accent}`}>
          <span className="product-art-label">
            {product.type === "server" ? "SERVER" : isService ? "SERVICE" : "MOD PACK"}
          </span>
          <div className="product-art-symbol">
            {product.type === "server" ? (
              <Server size={78} strokeWidth={1.2} />
            ) : isService ? (
              <Wrench size={78} strokeWidth={1.2} />
            ) : (
              <PackageCheck size={78} strokeWidth={1.2} />
            )}
          </div>
        </div>
        <article className="product-detail-copy">
          <Badge>
            {product.tag ??
              (product.type === "server"
                ? "Game server"
                : isService
                  ? "Setup service"
                  : "Mod or tool")}
          </Badge>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="product-detail-spec">
            <span>Specifications</span>
            <strong>{product.meta}</strong>
          </div>
          <div className="product-detail-buy">
            <div>
              <span>
                {product.type === "server"
                  ? "Monthly hosting"
                  : isService
                    ? "One-time setup"
                    : "One-time download"}
              </span>
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <ProductAddToCart product={product} />
          </div>
          <small className="detail-note">
            Sign in before ordering to save this purchase to your account. Payments are handled
            securely by Payments.lk.
          </small>
        </article>
      </div>
    </main>
  );
}
