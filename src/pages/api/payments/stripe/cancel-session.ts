import type { NextApiRequest, NextApiResponse } from "next";

import { getSessionUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { markStripeOrderPaid, releaseStripeOrderReservation } from "@/lib/stripe-orders";
import prisma from "@/lib/prisma";

export default async function cancelStripeSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
  if (!sessionId) return res.status(400).json({ message: "Missing Checkout Session ID." });

  try {
    const order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });
    if (!order || order.userId !== user.id) {
      return res.status(404).json({ message: "Order not found." });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderId !== order.id) {
      return res.status(400).json({ message: "Checkout Session does not match the order." });
    }

    if (session.payment_status === "paid") {
      const paidOrder = await markStripeOrderPaid(session, user.id);
      return res.status(200).json({ orderId: paidOrder.id, status: paidOrder.status });
    }

    if (session.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
    await releaseStripeOrderReservation(order.id, sessionId);

    return res.status(200).json({ orderId: order.id, status: "CANCELLED" });
  } catch (error) {
    console.error("Unable to cancel Stripe Checkout Session", error);
    return res.status(500).json({ message: "Unable to cancel checkout right now." });
  }
}
