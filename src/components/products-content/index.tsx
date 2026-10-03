import { useState } from "react";
import { useRouter } from "next/router";

import List from "./list";

const ProductsContent = () => {
  const router = useRouter();
  const [orderProductsOpen, setOrderProductsOpen] = useState(false);
  const selectedSort = typeof router.query.sort === "string" ? router.query.sort : "popular";

  const updateSort = (sort: string) => {
    void router.push({ pathname: router.pathname, query: { ...router.query, sort } }, undefined, {
      shallow: true,
    });
  };

  return (
    <section className="products-content">
      <div className="products-content__intro">
        <h2>
          Men's Tops <span>(catalog)</span>
        </h2>
        <button
          type="button"
          onClick={() => setOrderProductsOpen(!orderProductsOpen)}
          className="products-filter-btn"
        >
          <i className="icon-filters" />
        </button>
        <form
          className={`products-content__filter ${orderProductsOpen ? "products-order-open" : ""}`}
        >
          <div className="products__filter__select">
            <h4>Show products: </h4>
            <div className="select-wrapper">
              <select value={selectedSort} onChange={(event) => updateSort(event.target.value)}>
                <option value="popular">Popular</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          <div className="products__filter__select">
            <h4>Sort by: </h4>
            <div className="select-wrapper">
              <select value={selectedSort} onChange={(event) => updateSort(event.target.value)}>
                <option value="popular">Popular</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <List />
    </section>
  );
};

export default ProductsContent;
