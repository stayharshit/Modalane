import type Stripe from "stripe";

import prisma from "@/lib/prisma";

export const markStripeOrderPaid = async (
  session: Stripe.Checkout.Session,
  userId?: string,
) => {
  const orderId = session.metadata?.orderId;
  if (!orderId || session.mode !== "payment" || session.payment_status !== "paid") {
    throw new Error("Stripe session is not a paid checkout session.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (
    !order ||
    order.stripeCheckoutSessionId !== session.id ||
    (userId && order.userId !== userId)
  ) {
    throw new Error("Stripe session does not match an order.");
  }

  if (
    session.amount_total !== order.total ||
    session.currency?.toUpperCase() !== order.currency
  ) {
    throw new Error("Stripe session amount does not match the order.");
  }

  if (order.status === "PAID") return order;
  if (order.status !== "PENDING") throw new Error("Order is no longer payable.");

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const result = await prisma.order.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: {
      status: "PAID",
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
    },
  });

  if (result.count === 0) {
    const currentOrder = await prisma.order.findUnique({ where: { id: order.id } });
    if (currentOrder?.status === "PAID") return currentOrder;
    throw new Error("Unable to mark the order as paid.");
  }

  const paidOrder = await prisma.order.findUnique({ where: { id: order.id } });
  if (!paidOrder) throw new Error("Paid order could not be loaded.");
  return paidOrder;
};

export const releaseStripeOrderReservation = async (
  orderId: string,
  sessionId?: string,
) =>
  prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status !== "PENDING") return;
    if (sessionId && order.stripeCheckoutSessionId !== sessionId) return;

    const result = await transaction.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (result.count === 0) return;

    for (const item of order.items) {
      await transaction.product.update({
        where: { id: item.productId },
        data: { quantityAvailable: { increment: item.quantity } },
      });
    }
  });
