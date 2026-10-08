import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  addToWishlist,
  getCurrentCustomer,
  getProduct,
  getWishlist,
  removeFromWishlist,
} from "../services/api";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [authLoading, setAuthLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentCustomer().catch(() => {
      if (active) navigate("/login", { replace: true });
    }).finally(() => {
      if (active) setAuthLoading(false);
    });
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    getProduct(id)
      .then((data) => { if (active) setProduct(data.product); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });

    getWishlist()
      .then((data) => {
        if (!active) return;
        setInWishlist((data.wishlist ?? []).some((p) => p._id === id));
      })
      .catch(() => {});

    return () => { active = false; };
  }, [id]);

  async function handleToggle() {
    setToggling(true);
    setToggleError("");
    const next = !inWishlist;
    setInWishlist(next);
    try {
      if (next) {
        await addToWishlist(id).catch((err) => {
          if (err.message && /already in wishlist/i.test(err.message)) return;
          throw err;
        });
      } else {
        await removeFromWishlist(id);
      }
    } catch (err) {
      setInWishlist(!next);
      setToggleError(err.message || "Could not update wishlist");
    } finally {
      setToggling(false);
    }
  }

  if (authLoading) {
    return <main className="loading-page">Loading...</main>;
  }

  if (loading) return (
    <>
      <Navbar />
      <main className="products-page"><p className="products-state">Loading products...</p></main>
    </>
  );
  if (error || !product) return (
    <>
      <Navbar />
      <main className="products-page"><p className="products-state" role="alert">Something went wrong while loading products.</p></main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="products-page">
        <section className="product-details">
          <Link to="/products" className="back-link">← Back to products</Link>
          <img className="product-details-image" src={product.image} alt={product.name} />
          <div className="product-details-content">
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            <p className="product-price">{formatPrice(product.price)}</p>
            <p className={product.stock > 0 ? "stock-available" : "stock-empty"}>
              {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
            </p>
            <button type="button" className="button add-to-cart">Add to Cart</button>
            <button
              type="button"
              className={`button wishlist-toggle ${inWishlist ? "wishlist-toggle-active" : ""}`}
              onClick={handleToggle}
              disabled={toggling}
              aria-pressed={inWishlist}
            >
              {toggling ? "Saving..." : inWishlist ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
            </button>
            {toggleError && <p className="form-error" role="alert">{toggleError}</p>}
          </div>
        </section>
      </main>
    </>
  );
}
