import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const category = typeof req.query.category === "string" ? req.query.category.toLowerCase() : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "popular";

  const products = await prisma.product.findMany();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !search || product.name.toLowerCase().includes(search);
    const matchesCategory = !category || product.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((first, second) => {
    if (sort === "price-asc") return first.currentPrice - second.currentPrice;
    if (sort === "price-desc") return second.currentPrice - first.currentPrice;
    if (sort === "name") return first.name.localeCompare(second.name);
    return Number(second.discount ?? 0) - Number(first.discount ?? 0);
  });

  return res.status(200).json(sortedProducts.map(serializeProduct));
};
