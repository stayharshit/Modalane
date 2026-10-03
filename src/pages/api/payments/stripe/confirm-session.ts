import type { NextApiRequest, NextApiResponse } from "next";

import { getSessionUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { markStripeOrderPaid } from "@/lib/stripe-orders";
import prisma from "@/lib/prisma";

export default async function confirmStripeSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const sessionId = typeof req.query.session_id === "string" ? req.query.session_id : "";
  if (!sessionId) return res.status(400).json({ message: "Missing Checkout Session ID." });

  try {
    const order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });
    if (!order || order.userId !== user.id) {
      return res.status(404).json({ message: "Order not found." });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderId !== order.id) {
      return res.status(400).json({ message: "Checkout Session does not match the order." });
    }

    if (session.payment_status === "paid") {
      const paidOrder = await markStripeOrderPaid(session, user.id);
      return res.status(200).json({ orderId: paidOrder.id, status: paidOrder.status });
    }

    return res.status(202).json({ orderId: order.id, status: order.status });
  } catch (error) {
    console.error("Unable to confirm Stripe Checkout Session", error);
    return res.status(500).json({ message: "Unable to confirm payment yet." });
  }
}
