import Link from "next/link";

import Layout from "../../layouts/Main";

const RegisterPage = () => (
  <Layout title="Create an account | Modalane" description="Create your Modalane account.">
    <section className="form-page">
      <div className="container">
        <div className="back-button-section">
          <Link href="/products">
            <i className="icon-left" />
            Back to store
          </Link>
        </div>

        <div className="form-block">
          <h2 className="form-block__title">
            Create an account and discover the benefits
          </h2>
          <p className="form-block__description">
            Save your preferences, track orders, and check out faster.
          </p>

          <form className="form">
            <div className="form__input-row">
              <input
                className="form__input"
                placeholder="First Name"
                type="text"
                autoComplete="given-name"
              />
            </div>

            <div className="form__input-row">
              <input
                className="form__input"
                placeholder="Last Name"
                type="text"
                autoComplete="family-name"
              />
            </div>

            <div className="form__input-row">
                <input className="form__input" placeholder="Email" type="email" autoComplete="email" />
            </div>

            <div className="form__input-row">
              <input
                className="form__input"
                type="Password"
                placeholder="Password"
                autoComplete="new-password"
              />
            </div>

            <div className="form__info">
              <div className="checkbox-wrapper">
                <label
                  htmlFor="check-signed-in"
                  className="checkbox checkbox--sm"
                >
                  <input
                    name="signed-in"
                    type="checkbox"
                    id="check-signed-in"
                  />
                  <span className="checkbox__check" />
                  <p>
                    I agree to the Google Terms of Service and Privacy Policy
                  </p>
                </label>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--rounded btn--yellow btn-submit"
            >
              Sign up
            </button>

            <p className="form__signup-link">
              <Link href="/login">Are you already a member?</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  </Layout>
);

export default RegisterPage;
