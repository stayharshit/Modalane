import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

import CheckoutItems from "@/components/checkout/items";
import CheckoutStatus from "@/components/checkout-status";
import type { RootState } from "@/store";

import Layout from "../../layouts/Main";

type CheckoutUser = {
  email: string;
  firstName: string;
  lastName: string;
};

type ShippingDetails = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

type ToastItem = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

const validateShippingDetails = (details: ShippingDetails): ShippingErrors => {
  const errors: ShippingErrors = {};

  if (!details.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!details.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!details.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!details.address.trim()) {
    errors.address = "Street address is required.";
  }

  if (!details.city.trim()) {
    errors.city = "City is required.";
  }

  if (!details.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  }

  if (!details.country.trim()) {
    errors.country = "Country is required.";
  }

  if (!details.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9+()\-\s]{7,20}$/.test(details.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
};

const CheckoutPage = () => {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "anonymous" | "error">("loading");
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, type: ToastItem["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  };

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.status === 401) {
          if (!cancelled) setAuthStatus("anonymous");
          return;
        }
        if (!response.ok) throw new Error("Unable to verify account");

        const result: { user: CheckoutUser } = await response.json();
        if (!cancelled) {
          setShippingDetails((current) => ({
            ...current,
            email: current.email || result.user.email,
            firstName: current.firstName || result.user.firstName,
            lastName: current.lastName || result.user.lastName,
          }));
          setAuthStatus("authenticated");
        }
      } catch {
        if (!cancelled) setAuthStatus("error");
      }
    };

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sessionId =
      typeof router.query.session_id === "string" ? router.query.session_id : "";
    if (!router.isReady || router.query.payment !== "cancelled" || !sessionId) return;

    let cancelled = false;
    const releaseCheckout = async () => {
      try {
        const response = await fetch("/api/payments/stripe/cancel-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const result: { status?: string; message?: string } = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to close checkout.");

        if (!cancelled) {
          setPaymentNotice(
            result.status === "PAID"
              ? "Your payment was completed. Confirming your order..."
              : "Payment was not completed. Your cart is unchanged.",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentError(
            error instanceof Error ? error.message : "Unable to close checkout.",
          );
        }
      }
    };

    void releaseCheckout();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.payment, router.query.session_id]);

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const priceTotal = useSelector((state: RootState) => {
    const { cartItems } = state.cart;
    let totalPrice = 0;
    if (cartItems.length > 0) {
      cartItems.map((item) => (totalPrice += item.price * item.count));
    }

    return totalPrice;
  });

  const handleShippingChange = (field: keyof ShippingDetails, value: string) => {
    setShippingDetails((current) => ({ ...current, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const startPayment = async () => {
    setPaymentError("");
    if (authStatus !== "authenticated") {
      setPaymentError("Please log in before proceeding to payment.");
      pushToast("Please log in before proceeding to payment.", "error");
      return;
    }
    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty.");
      pushToast("Your cart is empty.", "error");
      return;
    }

    const nextErrors = validateShippingDetails(shippingDetails);
    setShippingErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setPaymentError("Please complete the highlighted shipping details.");
      pushToast("Please complete the highlighted shipping details.", "error");
      return;
    }

    setIsStartingPayment(true);
    try {
      const response = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.count,
          })),
          shippingDetails,
        }),
      });
      const result: { url?: string; message?: string } = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.message || "Unable to start payment. Please try again.");
      }

      pushToast("Payment session created successfully.", "success");
      window.location.assign(result.url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to start payment. Please try again.";
      setPaymentError(errorMessage);
      pushToast(errorMessage, "error");
      setIsStartingPayment(false);
    }
  };

  return (
    <Layout>
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <section className="cart">
        <div className="container">
          <div className="cart__intro">
            <h3 className="cart__title">Shipping and Payment</h3>
            <CheckoutStatus step="checkout" />
          </div>

          <div className="checkout-content">
            <div className="checkout__col-6">
              {authStatus === "anonymous" && (
                <div className="checkout__btns">
                  <Link href="/login" className="btn btn--rounded btn--yellow">
                    Log in
                  </Link>
                  <Link href="/register" className="btn btn--rounded btn--border">
                    Sign up
                  </Link>
                </div>
              )}
              {authStatus === "error" && (
                <p className="message message--error" role="alert">
                  We couldn't verify your account. Please refresh and try again.
                </p>
              )}

              <div className="block checkout-card">
                <h3 className="block__title">Shipping information</h3>
                <form className="form" noValidate>
                  <div className="form__input-row form__input-row--two">
                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Email <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.email ? "field-error" : ""}`}
                          type="email"
                          autoComplete="email"
                          placeholder="Email address"
                          value={shippingDetails.email}
                          onChange={(event) => handleShippingChange("email", event.target.value)}
                        />
                        {shippingErrors.email && <small className="field-error-text">{shippingErrors.email}</small>}
                      </label>
                    </div>

                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Address <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.address ? "field-error" : ""}`}
                          type="text"
                          placeholder="Street address"
                          value={shippingDetails.address}
                          onChange={(event) => handleShippingChange("address", event.target.value)}
                        />
                        {shippingErrors.address && <small className="field-error-text">{shippingErrors.address}</small>}
                      </label>
                    </div>
                  </div>

                  <div className="form__input-row form__input-row--two">
                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          First name <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.firstName ? "field-error" : ""}`}
                          type="text"
                          autoComplete="given-name"
                          placeholder="First name"
                          value={shippingDetails.firstName}
                          onChange={(event) => handleShippingChange("firstName", event.target.value)}
                        />
                        {shippingErrors.firstName && <small className="field-error-text">{shippingErrors.firstName}</small>}
                      </label>
                    </div>

                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          City <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.city ? "field-error" : ""}`}
                          type="text"
                          placeholder="City"
                          value={shippingDetails.city}
                          onChange={(event) => handleShippingChange("city", event.target.value)}
                        />
                        {shippingErrors.city && <small className="field-error-text">{shippingErrors.city}</small>}
                      </label>
                    </div>
                  </div>

                  <div className="form__input-row form__input-row--two">
                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Last name <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.lastName ? "field-error" : ""}`}
                          type="text"
                          autoComplete="family-name"
                          placeholder="Last name"
                          value={shippingDetails.lastName}
                          onChange={(event) => handleShippingChange("lastName", event.target.value)}
                        />
                        {shippingErrors.lastName && <small className="field-error-text">{shippingErrors.lastName}</small>}
                      </label>
                    </div>

                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Postal code <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.postalCode ? "field-error" : ""}`}
                          type="text"
                          placeholder="Postal code / ZIP"
                          value={shippingDetails.postalCode}
                          onChange={(event) => handleShippingChange("postalCode", event.target.value)}
                        />
                        {shippingErrors.postalCode && <small className="field-error-text">{shippingErrors.postalCode}</small>}
                      </label>
                    </div>
                  </div>

                  <div className="form__input-row form__input-row--two">
                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Phone number <span className="required-asterisk">*</span>
                        </span>
                        <input
                          className={`form__input form__input--sm ${shippingErrors.phone ? "field-error" : ""}`}
                          type="tel"
                          autoComplete="tel"
                          placeholder="Phone number"
                          value={shippingDetails.phone}
                          onChange={(event) => handleShippingChange("phone", event.target.value)}
                        />
                        {shippingErrors.phone && <small className="field-error-text">{shippingErrors.phone}</small>}
                      </label>
                    </div>

                    <div className="form__col">
                      <label className="field-label">
                        <span>
                          Country <span className="required-asterisk">*</span>
                        </span>
                        <select
                          className={`form__input form__input--sm ${shippingErrors.country ? "field-error" : ""}`}
                          value={shippingDetails.country}
                          onChange={(event) => handleShippingChange("country", event.target.value)}
                        >
                          <option value="">Select country</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {shippingErrors.country && <small className="field-error-text">{shippingErrors.country}</small>}
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="checkout__col-4">
              <div className="block checkout-card">
                <h3 className="block__title">Payment method</h3>
                <ul className="round-options round-options--three">
                  <li className="round-item">
                    <img src="/images/logos/paypal.png" alt="Paypal" />
                  </li>
                  <li className="round-item">
                    <img src="/images/logos/visa.png" alt="Paypal" />
                  </li>
                  <li className="round-item">
                    <img src="/images/logos/mastercard.png" alt="Paypal" />
                  </li>
                  <li className="round-item">
                    <img src="/images/logos/maestro.png" alt="Paypal" />
                  </li>
                  <li className="round-item">
                    <img src="/images/logos/discover.png" alt="Paypal" />
                  </li>
                  <li className="round-item">
                    <img src="/images/logos/ideal-logo.svg" alt="Paypal" />
                  </li>
                </ul>
              </div>

              <div className="block checkout-card">
                <h3 className="block__title">Delivery method</h3>
                <ul className="round-options round-options--two">
                  <li className="round-item round-item--bg">
                    <img src="/images/logos/inpost.svg" alt="Paypal" />
                    <p>$20.00</p>
                  </li>
                  <li className="round-item round-item--bg">
                    <img src="/images/logos/dpd.svg" alt="Paypal" />
                    <p>$12.00</p>
                  </li>
                  <li className="round-item round-item--bg">
                    <img src="/images/logos/dhl.svg" alt="Paypal" />
                    <p>$15.00</p>
                  </li>
                  <li className="round-item round-item--bg">
                    <img src="/images/logos/maestro.png" alt="Paypal" />
                    <p>$10.00</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="checkout__col-2">
              <div className="block checkout-card checkout-card--summary">
                <h3 className="block__title">Your cart</h3>
                <CheckoutItems />

                <div className="checkout-total">
                  <p>Total cost</p>
                  <h3>${priceTotal}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="cart-actions cart-actions--checkout">
            <Link href="/cart" className="cart__btn-back">
              <i className="icon-left" /> Back
            </Link>
            <div className="cart-actions__items-wrapper">
              <button type="button" className="btn btn--rounded btn--border">
                Continue shopping
              </button>
              <button
                type="button"
                className="btn btn--rounded btn--yellow"
                onClick={startPayment}
                disabled={isStartingPayment || authStatus === "loading" || cartItems.length === 0}
              >
                {isStartingPayment ? "Opening secure checkout..." : "Proceed to payment"}
              </button>
            </div>
            {paymentNotice && <p className="message" role="status">{paymentNotice}</p>}
            {paymentError && <p className="message message--error" role="alert">{paymentError}</p>}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;
