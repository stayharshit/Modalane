import type { NextApiRequest, NextApiResponse } from "next";

import { getSessionUser } from "@/lib/session";
import prisma from "@/lib/prisma";

const orderInclude = {
  items: { include: { product: true } },
};

type OrderRequestItem = {
  productId: string;
  quantity: number;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  if (req.method === "GET") {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(orders);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
  const items: OrderRequestItem[] = rawItems.filter(
    (item: unknown): item is OrderRequestItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { productId?: unknown }).productId === "string" &&
      Number.isInteger((item as { quantity?: unknown }).quantity) &&
      Number((item as { quantity: number }).quantity) > 0,
  );

  if (items.length === 0) {
    return res.status(400).json({ message: "At least one valid order item is required" });
  }

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: items.map((item) => item.productId) } },
      });

      if (products.length !== items.length) {
        throw new Error("One or more products are unavailable");
      }

      const orderItems: Array<OrderRequestItem & { unitPrice: number }> = items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product || product.quantityAvailable < item.quantity) {
          throw new Error(`Insufficient inventory for product ${item.productId}`);
        }

        return {
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.currentPrice,
        };
      });

      const total = orderItems.reduce<number>(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );

      for (const item of orderItems) {
        await transaction.product.update({
          where: { id: item.productId },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
      }

      return transaction.order.create({
        data: {
          userId: user.id,
          total,
          paymentMethod: typeof req.body.paymentMethod === "string" ? req.body.paymentMethod : null,
          items: { create: orderItems },
        },
        include: orderInclude,
      });
    });

    return res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return res.status(400).json({ message });
  }
};
