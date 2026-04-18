import ProductDetailClient from "../../../components/ProductDetailClient";

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  return <ProductDetailClient productId={resolvedParams.id} />;
}
