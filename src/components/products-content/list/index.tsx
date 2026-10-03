import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { ProductTypeList } from "@/types";

import ProductItem from "../../product-item";
import ProductsLoading from "./loading";

const ProductsContent = () => {
  const router = useRouter();
  const [data, setData] = useState<ProductTypeList[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const query = new URLSearchParams();
  const search = typeof router.query.search === "string" ? router.query.search : "";
  const category = typeof router.query.category === "string" ? router.query.category : "";
  const sort = typeof router.query.sort === "string" ? router.query.sort : "popular";

  if (search) query.set("search", search);
  if (category) query.set("category", category);
  query.set("sort", sort);
  const queryString = query.toString();

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`/api/products?${queryString}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Unable to load products");

        const products: ProductTypeList[] = await response.json();
        if (!cancelled) setData(products);
      } catch {
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  if (hasError) return <p className="message message--error">Unable to load products.</p>;
  return (
    <>
      {isLoading && !data && <ProductsLoading />}

      {!isLoading && data && (
        <section className="products-list">
          {data.map((item: ProductTypeList) => (
            <ProductItem
              id={item.id}
              name={item.name}
              price={item.price}
              color={item.color}
              currentPrice={item.currentPrice}
              key={item.id}
              images={item.images}
            />
          ))}
          {data.length === 0 && <p>No products match your current filters.</p>}
        </section>
      )}
    </>
  );
};

export default ProductsContent;
