import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Layout from "../../layouts/Main";
import { server } from "../../utils/server";
import { postData } from "../../utils/services";

type LoginMail = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { register, handleSubmit, errors, setValue } = useForm();
  const demoCredentials = {
    email: "demo@modalane.test",
    password: "modalane-demo",
  };

  const onSubmit = async (data: LoginMail) => {
    setMessage("");

    try {
      const response = await postData(`${server}/api/login`, {
        email: data.email,
        password: data.password,
      });

      if (response.status === true) {
        await router.push("/profile");
        return;
      }

      setMessage(response.message || "Unable to sign in. Check your email and password.");
    } catch {
      setMessage("Unable to sign in right now. Please try again.");
    }
  };

  return (
    <Layout title="Sign in | Modalane" description="Sign in to manage your Modalane account and orders.">
      <section className="form-page">
        <div className="container">
          <div className="back-button-section">
            <Link href="/products">
              <i className="icon-left" />
              Back to store
            </Link>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">Log in</h2>
            <p className="form-block__description">
              Welcome back. Sign in to continue your shopping journey.
            </p>

            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <section className="demo-credentials" aria-label="Demo account">
                <h3 className="demo-credentials__title">Demo account</h3>
                <dl className="demo-credentials__list">
                  <div className="demo-credentials__row">
                    <dt>Email</dt>
                    <dd>{demoCredentials.email}</dd>
                  </div>
                  <div className="demo-credentials__row">
                    <dt>Password</dt>
                    <dd>{demoCredentials.password}</dd>
                  </div>
                </dl>
                <button
                  className="demo-credentials__action"
                  type="button"
                  onClick={() => {
                    setValue("email", demoCredentials.email);
                    setValue("password", demoCredentials.password);
                  }}
                >
                  Fill demo credentials
                </button>
              </section>

              <div className="form__input-row">
                <input
                  className="form__input"
                  placeholder="email"
                  type="text"
                  name="email"
                  autoComplete="email"
                  ref={register({
                    required: true,
                    pattern:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  })}
                />

                {errors.email && errors.email.type === "required" && (
                  <p className="message message--error">
                    This field is required
                  </p>
                )}

                {errors.email && errors.email.type === "pattern" && (
                  <p className="message message--error">
                    Please write a valid email
                  </p>
                )}
              </div>

              <div className="form__input-row">
                <input
                  className="form__input"
                  type="password"
                  placeholder="Password"
                  name="password"
                  autoComplete="current-password"
                  ref={register({ required: true })}
                />
                {errors.password && errors.password.type === "required" && (
                  <p className="message message--error">
                    This field is required
                  </p>
                )}
              </div>

              <div className="form__info">
                <div className="checkbox-wrapper">
                  <label
                    htmlFor="check-signed-in"
                    className="checkbox checkbox--sm"
                  >
                    <input
                      type="checkbox"
                      name="keepSigned"
                      id="check-signed-in"
                      ref={register({ required: false })}
                    />
                    <span className="checkbox__check" />
                    <p>Keep me signed in</p>
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="form__info__forgot-password"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="form__btns">
                <button type="button" className="btn-social fb-btn">
                  <i className="icon-facebook" />
                  Facebook
                </button>
                <button type="button" className="btn-social google-btn">
                  <img src="/images/icons/gmail.svg" alt="gmail" /> Gmail
                </button>
              </div>

              <button
                type="submit"
                className="btn btn--rounded btn--yellow btn-submit"
              >
                Sign in
              </button>

              {message && <p className="message message--error" role="alert">{message}</p>}

              <p className="form__signup-link">
                Not a member yet? <Link href="/register">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoginPage;
