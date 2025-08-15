'use client';
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const { productId } = params;

  return (
    <div>
      <h1>Product {productId}</h1>
      <p>Details about product {productId}...</p>
      <a href="/">Home</a> |{" "}
        <a href="/about">About</a> |{" "}
        <a href="/contact">Contact</a> |{" "}
        <a href="/marketplace">Products</a>
    </div>
  );
}
