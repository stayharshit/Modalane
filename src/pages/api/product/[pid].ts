import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { pid },
  } = req;

  const product = await prisma.product.findUnique({ where: { id: String(pid) } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(serializeProduct(product));
};
