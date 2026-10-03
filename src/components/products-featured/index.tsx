import Link from "next/link";
import useSwr from "swr";

import type { ProductTypeList } from "@/types";
import catalogProducts from "@/utils/data/products";

import ProductsCarousel from "./carousel";

const fallbackProducts: ProductTypeList[] = catalogProducts.map((product) => ({
  id: product.id,
  name: product.name,
  price: String(product.price),
  color: product.colors[0] ?? "",
  currentPrice: product.currentPrice,
  discount: product.discount ? String(product.discount) : undefined,
  images: product.images,
}));

const ProductsFeatured = () => {
  const fetcher = async (url: string): Promise<ProductTypeList[]> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Unable to load featured products");
    }

    return response.json();
  };
  const { data, error } = useSwr<ProductTypeList[]>("/api/products", fetcher);
  const featuredProducts = data ?? fallbackProducts;

  return (
    <section className="section section-products-featured">
      <div className="container">
        <header className="section-products-featured__header">
          <h3>Selected just for you</h3>
          <Link href="/products" className="btn btn--rounded btn--border">
            Show All
          </Link>
        </header>

        {error && <p className="message message--error">Showing saved product picks.</p>}
        <ProductsCarousel products={featuredProducts} />
      </div>
    </section>
  );
};

export default ProductsFeatured;
