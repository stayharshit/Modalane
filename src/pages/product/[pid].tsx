import type { GetServerSideProps } from "next";
import { useState } from "react";

import Breadcrumb from "@/components/breadcrumb";
import Content from "@/components/product-single/content";
import Description from "@/components/product-single/description";
import Gallery from "@/components/product-single/gallery";
import Reviews from "@/components/product-single/reviews";
import ProductsFeatured from "@/components/products-featured";
import { serializeProduct } from "@/lib/products";
import prisma from "@/lib/prisma";
import type { SerializedProduct } from "@/lib/products";

import Layout from "../../layouts/Main";

type ProductPageType = {
  product: SerializedProduct;
};

export const getServerSideProps: GetServerSideProps<ProductPageType> = async ({ params }) => {
  const productId = params?.pid;
  if (typeof productId !== "string") return { notFound: true };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { notFound: true };

  return {
    props: {
      product: serializeProduct(product),
    },
  };
};

const Product = ({ product }: ProductPageType) => {
  const [showBlock, setShowBlock] = useState("description");

  return (
    <Layout title={`${product.name} | Modalane`} description={`Shop ${product.name} at Modalane.`}>
      <Breadcrumb />

      <section className="product-single">
        <div className="container">
          <div className="product-single__content">
            <Gallery images={product.images} />
            <Content product={product} />
          </div>

          <div className="product-single__info">
            <div className="product-single__info-btns">
              <button
                type="button"
                onClick={() => setShowBlock("description")}
                className={`btn btn--rounded ${showBlock === "description" ? "btn--active" : ""}`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setShowBlock("reviews")}
                className={`btn btn--rounded ${showBlock === "reviews" ? "btn--active" : ""}`}
              >
                Reviews ({product.reviews.length})
              </button>
            </div>

            <Description show={showBlock === "description"} />
            <Reviews product={product} show={showBlock === "reviews"} />
          </div>
        </div>
      </section>

      <div className="product-single-page">
        <ProductsFeatured />
      </div>
    </Layout>
  );
};

export default Product;
