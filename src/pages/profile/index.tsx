import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Layout from "../../layouts/Main";

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.status === 401) {
          await router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Unable to load your profile");

        const result: { user: Profile } = await response.json();
        if (!cancelled) setProfile(result.user);
      } catch {
        if (!cancelled) setError("Your profile could not be loaded. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const signOut = async () => {
    setError("");
    setSigningOut(true);

    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out");
      await router.replace("/login");
    } catch {
      setError("Unable to sign out right now. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <Layout title="Your profile | Modalane" description="View your Modalane account profile.">
      <section className="form-page">
        <div className="container">
          <div className="back-button-section">
            <Link href="/products">
              <i className="icon-left" />
              Back to store
            </Link>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">Your profile</h2>
            <p className="form-block__description">Your Modalane account details.</p>

            {loading && <p className="profile-state" role="status">Loading profile...</p>}
            {error && <p className="message message--error" role="alert">{error}</p>}
            {profile && (
              <dl className="profile-details">
                <div className="profile-details__row">
                  <dt className="profile-details__label">Name</dt>
                  <dd className="profile-details__value">{profile.firstName} {profile.lastName}</dd>
                </div>
                <div className="profile-details__row">
                  <dt className="profile-details__label">Email</dt>
                  <dd className="profile-details__value">{profile.email}</dd>
                </div>
                <div className="profile-details__row">
                  <dt className="profile-details__label">Member since</dt>
                  <dd className="profile-details__value">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            )}
            {profile && (
              <button
                type="button"
                className="btn btn--rounded btn--yellow btn-submit profile-signout"
                onClick={signOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProfilePage;