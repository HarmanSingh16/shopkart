import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import {
  getCurrentCustomer,
  getWishlist,
  removeFromWishlist,
} from "../services/api";

export default function Wishlist() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getCurrentCustomer()
      .then((profile) => {
        if (active) setCustomer(profile);
      })
      .catch(() => {
        if (active) navigate("/login", { replace: true });
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!customer) return;
    let active = true;
    setLoading(true);
    setError(false);

    getWishlist()
      .then((data) => {
        if (active) setWishlist(data.wishlist ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [customer, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  async function handleRemove(productId) {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      setError(true);
    } finally {
      setRemovingId(null);
    }
  }

  if (authLoading) {
    return <main className="loading-page">Loading your account...</main>;
  }

  if (!customer) return null;

  return (
    <main className="home-page">
      <Navbar />
      <section className="products-content wishlist-page" aria-labelledby="wishlist-title">
        <p className="eyebrow">Saved for later</p>
        <h1 id="wishlist-title">Your Wishlist</h1>
        {loading && <p className="products-state">Loading wishlist...</p>}
        {!loading && error && (
          <div className="products-state" role="alert">
            <p>Unable to load wishlist.</p>
            <button type="button" className="button button-secondary" onClick={retry}>
              Try Again
            </button>
          </div>
        )}
        {!loading && !error && wishlist.length === 0 && (
          <p className="products-state">Your wishlist is empty.</p>
        )}
        {!loading && !error && wishlist.length > 0 && (
          <section className="product-grid" aria-label="Wishlist">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removingId === product._id}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
