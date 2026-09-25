import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, PackageCheck, Server, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import { getActiveProductById } from "@/server/catalog/products";
import { CartButton } from "@/components/store/cart-button";
import { ProductAddToCart } from "@/components/store/product-add-to-cart";
import { absoluteUrl, siteName } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { parseProductFeatures } from "@/lib/products";

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
  const isAdmin = await isAdminUser();
  const features = parseProductFeatures(product);

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
            <Link
              className="ui-button ui-button-ghost sign-in-button"
              href={isAdmin ? "/admin" : "/dashboard"}
            >
              {isAdmin ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link className="ui-button ui-button-ghost sign-in-button" href="/sign-in">
              Sign in
            </Link>
          )}
          {!isAdmin && <CartButton />}
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> Back to store
          </Link>
        </div>
      </header>
      <div className="product-detail-layout">
        <div
          className={cn(
            "product-detail-visual",
            `product-art-${product.accent}`,
            product.imageUrl && "has-image",
          )}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="product-detail-image"
              priority
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="product-art-symbol">
              {product.type === "server" ? (
                <Server size={78} strokeWidth={1.2} />
              ) : isService ? (
                <Wrench size={78} strokeWidth={1.2} />
              ) : (
                <PackageCheck size={78} strokeWidth={1.2} />
              )}
            </div>
          )}
          <span className="product-art-label">
            {product.type === "server" ? "SERVER" : isService ? "SERVICE" : "MOD PACK"}
          </span>
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
            <span>
              {product.type === "server" ? "Server Features & Specifications" : "Specifications"}
            </span>
            {features.length > 0 ? (
              <ul className="product-detail-feature-points" aria-label="Product features">
                {features.map((feat, idx) => (
                  <li key={idx} className="product-detail-feature-item">
                    <Check size={14} className="feature-check-icon" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <strong>{product.meta}</strong>
            )}
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
            <ProductAddToCart product={product} isAdmin={isAdmin} />
          </div>
          {isAdmin ? (
            <small className="detail-note">
              You are viewing this product as an administrator. Purchasing and cart operations are
              disabled for admin accounts.
            </small>
          ) : (
            <small className="detail-note">
              Sign in before ordering to save this purchase to your account. Payments are handled
              securely by Payments.lk.
            </small>
          )}
        </article>
      </div>
    </main>
  );
}
