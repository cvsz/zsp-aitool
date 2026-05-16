"use client";
import { useState } from "react";

export function ProductForm() {
  const [title, setTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [price, setPrice] = useState("0");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, originalUrl, price: Number(price), currency: "THB", images: [] }) });
    setTitle(""); setOriginalUrl(""); setPrice("0");
  }

  return <form onSubmit={onSubmit} className="space-y-3">
    <input className="border p-2 w-full" required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
    <input className="border p-2 w-full" required type="url" placeholder="Original URL" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
    <input className="border p-2 w-full" required type="number" min={0} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
    <button className="bg-black text-white px-4 py-2" type="submit">Save Product</button>
  </form>;
}
