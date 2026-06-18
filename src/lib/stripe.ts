import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  if (process.env.NODE_ENV !== "production" && !secretKey.startsWith("sk_test_")) {
    throw new Error("Use a Stripe test-mode secret key during local development.");
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
};

export const getCheckoutBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) throw new Error("Set NEXT_PUBLIC_APP_URL for Stripe Checkout redirects.");

  return baseUrl.replace(/\/+$/, "");
};
