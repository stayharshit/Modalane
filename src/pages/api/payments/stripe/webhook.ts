import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import {
  markStripeOrderPaid,
  releaseStripeOrderReservation,
} from "@/lib/stripe-orders";

export const config = { api: { bodyParser: false } };

const readRawBody = async (request: NextApiRequest) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function stripeWebhook(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ message: "Stripe webhook is not configured." });
  }
  if (typeof signature !== "string") {
    return res.status(400).json({ message: "Stripe webhook signature is missing." });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await readRawBody(req),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Unable to verify Stripe webhook", error);
    return res.status(400).json({ message: "Invalid Stripe webhook signature." });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") await markStripeOrderPaid(session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await releaseStripeOrderReservation(orderId, session.id);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Unable to process Stripe webhook event", error);
    return res.status(500).json({ message: "Unable to process Stripe event." });
  }
}
