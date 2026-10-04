import Link from "next/link";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { getSessionUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { markStripeOrderPaid } from "@/lib/stripe-orders";
import prisma from "@/lib/prisma";
import { clearCart } from "@/store/reducers/cart";

import Layout from "../../layouts/Main";

type ConfirmationState = "paid" | "pending" | "error";

type SuccessPageProps = {
  state: ConfirmationState;
  orderId: string;
  sessionId: string;
  error: string;
};

type ConfirmationResponse = {
  orderId?: string;
  status?: string;
  message?: string;
};

export const getServerSideProps: GetServerSideProps<SuccessPageProps> = async ({ req, query }) => {
  const sessionId = typeof query.session_id === "string" ? query.session_id : "";
  if (!sessionId) {
    return { props: { state: "error", orderId: "", sessionId: "", error: "A Checkout Session was not provided." } };
  }

  try {
    const user = await getSessionUser(req);
    if (!user) {
      return { props: { state: "error", orderId: "", sessionId, error: "Sign in again to verify your payment." } };
    }

    const order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });
    if (!order || order.userId !== user.id) {
      return { props: { state: "error", orderId: "", sessionId, error: "We couldn't find this order." } };
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderId !== order.id) {
      return { props: { state: "error", orderId: "", sessionId, error: "The Checkout Session does not match this order." } };
    }

    if (session.payment_status === "paid") {
      const paidOrder = await markStripeOrderPaid(session, user.id);
      return { props: { state: "paid", orderId: paidOrder.id, sessionId, error: "" } };
    }

    return { props: { state: "pending", orderId: order.id, sessionId, error: "" } };
  } catch (error) {
    console.error("Unable to load Stripe payment confirmation", error);
    return { props: { state: "error", orderId: "", sessionId, error: "Unable to verify your payment right now." } };
  }
};

const CheckoutSuccessPage = ({
  state: initialState,
  orderId: initialOrderId,
  sessionId,
  error: initialError,
}: SuccessPageProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [state, setState] = useState(initialState);
  const orderId = initialOrderId;
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (state === "paid") {
      dispatch(clearCart());
      return;
    }
    if (state !== "pending") return;

    let cancelled = false;
    let retryTimer: number | undefined;
    let attempts = 0;

    const confirmPayment = async () => {
      try {
        const response = await fetch(
          `/api/payments/stripe/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const result: ConfirmationResponse = await response.json();

        if (cancelled) return;
        if (response.status === 202 && attempts < 5) {
          attempts += 1;
          retryTimer = window.setTimeout(() => void confirmPayment(), 1500);
          return;
        }
        if (!response.ok && response.status !== 202) {
          throw new Error(result.message || "Unable to confirm your payment.");
        }

        if (result.status === "PAID") {
          dispatch(clearCart());
          setState("paid");
        } else if (attempts >= 5) {
          setState("pending");
        } else {
          attempts += 1;
          retryTimer = window.setTimeout(() => void confirmPayment(), 1500);
        }
      } catch (confirmationError) {
        if (cancelled) return;
        setError(
          confirmationError instanceof Error
            ? confirmationError.message
            : "Unable to confirm your payment.",
        );
        setState("error");
      }
    };

    void confirmPayment();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [dispatch, initialOrderId, sessionId, state]);

  useEffect(() => {
    if (state !== "paid") return;

    const redirectTimer = window.setTimeout(() => {
      void router.replace("/");
    }, 7000);

    return () => window.clearTimeout(redirectTimer);
  }, [router, state]);

  return (
    <Layout title="Payment status | Modalane">
      {state === "paid" && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast toast--success">
            Payment confirmed. Your order has been placed.
          </div>
        </div>
      )}

      <section className="success-page">
        <div className="container">
          <div className="success-card">
            {state === "paid" && (
              <div className="success-check" role="img" aria-label="Payment successful">
                <span aria-hidden="true">&#10003;</span>
              </div>
            )}
            <h2 className="success-title">
              {state === "paid" ? "Payment confirmed" : "Payment status"}
            </h2>
            {state === "paid" && (
              <p className="form-block__description">
                Thank you. Your order has been placed.
                {orderId && <span> Order reference: {orderId}</span>}
              </p>
            )}
            {state === "pending" && (
              <p className="form-block__description" role="status">
                Your payment is still being confirmed. Please don't try to pay again.
              </p>
            )}
            {state === "error" && (
              <p className="message message--error" role="alert">{error}</p>
            )}
            <Link href={state === "paid" ? "/" : "/products"} className="btn btn--rounded btn--yellow success-button">
              {state === "paid" ? "Go to home" : "Continue shopping"}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutSuccessPage;
