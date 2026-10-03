import type { NextApiRequest, NextApiResponse } from "next";

import { getCheckoutBaseUrl, getStripe } from "@/lib/stripe";
import { releaseStripeOrderReservation } from "@/lib/stripe-orders";
import { getSessionUser } from "@/lib/session";
import prisma from "@/lib/prisma";

type RequestedItem = {
  productId: string;
  quantity: number;
};

class InsufficientInventoryError extends Error {}

export default async function createStripeCheckoutSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const rawItems: unknown[] = Array.isArray(req.body?.items) ? req.body.items : [];
  if (rawItems.length === 0 || rawItems.length > 100) {
    return res.status(400).json({ message: "Your cart is empty or invalid." });
  }

  const quantities = new Map<string, number>();
  for (const item of rawItems) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { productId?: unknown }).productId !== "string" ||
      !Number.isInteger((item as { quantity?: unknown }).quantity) ||
      Number((item as { quantity: number }).quantity) < 1
    ) {
      return res.status(400).json({ message: "Your cart contains an invalid item." });
    }

    const { productId, quantity } = item as RequestedItem;
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
  });
  if (products.length !== quantities.size) {
    return res.status(400).json({ message: "One or more products are unavailable." });
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const orderItems = products.map((product) => ({
    productId: product.id,
    name: product.name,
    quantity: quantities.get(product.id) ?? 0,
    unitPrice: product.currentPrice,
  }));

  if (
    orderItems.some(
      (item) => {
        const product = productsById.get(item.productId);
        return !product || item.quantity < 1 || item.quantity > product.quantityAvailable;
      },
    )
  ) {
    return res.status(409).json({ message: "One or more items are no longer available in that quantity." });
  }

  const total = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  if (!Number.isSafeInteger(total) || total <= 0) {
    return res.status(400).json({ message: "The order total is invalid." });
  }

  let orderId: string | undefined;
  let session: Awaited<ReturnType<ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]>> | undefined;

  try {
    const order = await prisma.$transaction(async (transaction) => {
      for (const item of orderItems) {
        const reservation = await transaction.product.updateMany({
          where: {
            id: item.productId,
            quantityAvailable: { gte: item.quantity },
          },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
        if (reservation.count !== 1) throw new InsufficientInventoryError();
      }

      return transaction.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          total,
          currency: "USD",
          paymentMethod: "stripe",
          items: {
            create: orderItems.map(({ productId, quantity, unitPrice }) => ({
              productId,
              quantity,
              unitPrice,
            })),
          },
        },
      });
    });
    orderId = order.id;

    const stripe = getStripe();
    const baseUrl = getCheckoutBaseUrl();
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      })),
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "IN"],
      },
      metadata: { orderId: order.id, userId: user.id },
      success_url: `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart/checkout?payment=cancelled&session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return res.status(201).json({ url: session.url });
  } catch (error) {
    if (session) {
      await getStripe().checkout.sessions.expire(session.id).catch(() => undefined);
    }
    if (orderId) await releaseStripeOrderReservation(orderId);

    if (error instanceof InsufficientInventoryError) {
      return res.status(409).json({ message: "One or more items are no longer available." });
    }

    console.error("Unable to create Stripe Checkout session", error);
    return res.status(500).json({ message: "Unable to start payment. Please try again." });
  }
}
