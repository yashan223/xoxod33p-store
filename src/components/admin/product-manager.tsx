"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, ProductType } from "@/types/product";

type ProductManagerProps = { products: Product[] };
type Draft = { name: string; type: ProductType; description: string; meta: string; price: string; accent: string; active: boolean };
const blankDraft: Draft = { name: "", type: "server", description: "", meta: "", price: "", accent: "slate", active: true };

export function ProductManager({ products: initialProducts }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  function changeDraft(key: keyof Draft, value: string | boolean) { setDraft((current) => ({ ...current, [key]: value })); }
  function openCreate() { setEditingId(null); setDraft(blankDraft); setImageFile(null); setStatus(""); setIsEditorOpen(true); }
  function editProduct(product: Product) { setEditingId(product.id); setDraft({ name: product.name, type: product.type, description: product.description, meta: product.meta, price: String(product.price), accent: product.accent, active: product.active }); setImageFile(null); setStatus(""); setIsEditorOpen(true); }
  function closeEditor() { setIsEditorOpen(false); setEditingId(null); setDraft(blankDraft); setImageFile(null); setStatus(""); }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, price: Number(draft.price) }) });
    const result = await response.json() as { product?: Product; error?: string };
    if (!response.ok) return setStatus(result.error ?? "Unable to save product.");
    const productId = editingId ?? result.product?.id;
    let imageUrl = editingId ? products.find((product) => product.id === editingId)?.imageUrl : result.product?.imageUrl;
    if (imageFile && productId) {
      const imageForm = new FormData();
      imageForm.append("file", imageFile);
      const imageResponse = await fetch(`/api/admin/products/${productId}/image`, { method: "POST", body: imageForm });
      const imageResult = await imageResponse.json() as { imageUrl?: string; error?: string };
      if (!imageResponse.ok || !imageResult.imageUrl) return setStatus(imageResult.error ?? "Unable to upload product image.");
      imageUrl = imageResult.imageUrl;
    }
    if (editingId) setProducts((current) => current.map((product) => product.id === editingId ? { ...product, ...draft, price: Number(draft.price), imageUrl } : product));
    else if (result.product) setProducts((current) => [{ ...result.product!, imageUrl }, ...current]);
    closeEditor();
  }

  async function toggleProduct(product: Product) { await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, active: !product.active, price: product.price }) }); setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item)); }
  async function deleteProduct(product: Product) { if (!window.confirm(`Delete ${product.name}?`)) return; const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }); if (response.ok) setProducts((current) => current.filter((item) => item.id !== product.id)); }

  return <div className="product-manager"><section className="admin-panel product-cards-panel"><div className="admin-panel-header"><div><span className="admin-kicker">Live catalog</span><h2>Products</h2></div><div className="product-panel-actions"><span className="admin-panel-meta">{products.length} total</span><Button size="sm" type="button" onClick={openCreate}>Add product</Button></div></div>{products.length === 0 ? <div className="admin-empty"><p>No products yet.</p><Button size="sm" type="button" onClick={openCreate}>Add first product</Button></div> : <div className="admin-product-grid">{products.map((product) => <article className="admin-product-card" key={product.id}><div className={`admin-product-art product-art-${product.accent}`}>{product.imageUrl ? <Image src={product.imageUrl} alt="" width={400} height={240} /> : <span>{product.type.toUpperCase()}</span>}</div><div className="admin-product-card-body"><div><span className="admin-kicker">{product.active ? "Active" : "Hidden"}</span><h3>{product.name}</h3><p>{product.description}</p></div><strong>Rs. {product.price.toLocaleString("en-LK")}</strong><div className="admin-product-actions"><button type="button" onClick={() => editProduct(product)}>Edit</button><button type="button" onClick={() => void toggleProduct(product)}>{product.active ? "Hide" : "Show"}</button><button className="danger" type="button" onClick={() => void deleteProduct(product)}>Delete</button></div></div></article>)}</div>}</section>{isEditorOpen && <div className="product-modal" role="dialog" aria-modal="true" aria-label={editingId ? "Edit product" : "Add product"}><div className="product-modal-header"><div><span className="admin-kicker">Catalog tools</span><h2>{editingId ? "Edit product" : "Add product"}</h2></div><button className="product-modal-close" type="button" onClick={closeEditor} aria-label="Close product editor"><X size={20} /></button></div><form className="product-editor-form" onSubmit={saveProduct}><label>Name<Input value={draft.name} onChange={(event) => changeDraft("name", event.target.value)} required /></label><label>Type<select value={draft.type} onChange={(event) => changeDraft("type", event.target.value)}><option value="server">Server</option><option value="mod">Mod / tool</option><option value="service">Service</option></select></label><label>Price (Rs.)<Input type="number" min="0" value={draft.price} onChange={(event) => changeDraft("price", event.target.value)} required /></label><label>Specification<Input value={draft.meta} onChange={(event) => changeDraft("meta", event.target.value)} placeholder="20 slots / v1.0 / setup" required /></label><label>Product image<input accept="image/*" type="file" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label><label className="product-editor-wide">Description<textarea value={draft.description} onChange={(event) => changeDraft("description", event.target.value)} required /></label><div className="product-modal-actions"><Button variant="outline" type="button" onClick={closeEditor}>Cancel</Button><Button type="submit">{editingId ? "Save changes" : "Add product"}</Button></div>{status && <p className="product-editor-status">{status}</p>}</form></div>}</div>;
}