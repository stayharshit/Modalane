import type { ProductTypeList } from "@/types";

import ProductItem from "../../product-item";

type ProductsCarouselType = {
  products: ProductTypeList[];
};

const ProductsCarousel = ({ products }: ProductsCarouselType) => {
  if (products.length === 0) return <p>No featured products available.</p>;

  return (
    <div className="products-carousel">
      <div className="products-carousel__track">
        {products.map((item) => (
          <div key={item.id} className="products-carousel__slide">
            <ProductItem
              id={item.id}
              name={item.name}
              price={item.price}
              color={item.color}
              discount={item.discount}
              currentPrice={item.currentPrice}
              key={item.id}
              images={item.images}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsCarousel;
