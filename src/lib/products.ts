import type { Product } from "@prisma/client";

const parseJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const serializeProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  price: product.price / 100,
  discount: product.discount ?? undefined,
  quantityAvailable: product.quantityAvailable,
  category: product.category,
  currentPrice: product.currentPrice / 100,
  sizes: parseJson<string[]>(product.sizes, []),
  colors: parseJson<string[]>(product.colors, []),
  images: parseJson<string[]>(product.images, []),
  punctuation: parseJson(product.punctuation, { countOpinions: 0, punctuation: 0, votes: [] }),
  reviews: parseJson(product.reviews, []),
});
