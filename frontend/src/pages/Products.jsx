import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import {
  addToWishlist,
  getCurrentCustomer,
  getProducts,
  getWishlist,
  removeFromWishlist,
} from "../services/api";
import { useCart } from "../context/CartContext";

export default function Products() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [toggleMessage, setToggleMessage] = useState("");
  const { addToCart, actionId } = useCart();
  const [cartMessage, setCartMessage] = useState("");

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
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(false);

    Promise.all([getProducts({ search, category }), getWishlist()])
      .then(([productsData, wishlistData]) => {
        if (!active) return;
        setProducts(productsData.products);
        setWishlistIds(new Set((wishlistData.wishlist ?? []).map((p) => p._id)));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [search, category, authLoading]);

  async function handleToggle(productId, action) {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (action === "add") next.add(productId);
      else next.delete(productId);
      return next;
    });

    try {
      if (action === "add") {
        await addToWishlist(productId).catch(async (err) => {
          if (err.message && /already in wishlist/i.test(err.message)) return;
          throw err;
        });
      } else {
        await removeFromWishlist(productId);
      }
      setToggleMessage("");
    } catch (err) {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (action === "add") next.delete(productId);
        else next.add(productId);
        return next;
      });
      setToggleMessage(err.message || "Could not update wishlist");
    }
  }

  async function handleAddToCart(productId) {
    setCartMessage("");
    try {
      await addToCart(productId);
    } catch (err) {
      setCartMessage(err.message || "Could not add to cart");
    }
  }

  if (authLoading) {
    return <main className="loading-page">Loading...</main>;
  }

  return (
    <>
      <Navbar />
      <main className="products-page">
        <section className="products-content" aria-labelledby="products-title">
          <p className="eyebrow">ShopKart catalogue</p>
          <h1 id="products-title">Products</h1>
          <SearchBar search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} />
          {toggleMessage && (
            <p className="products-state" role="alert">{toggleMessage}</p>
          )}
          {cartMessage && (
            <p className="products-state" role="alert">{cartMessage}</p>
          )}
          {loading && <p className="products-state">Loading products...</p>}
          {!loading && error && <p className="products-state" role="alert">Something went wrong while loading products.</p>}
          {!loading && !error && products.length === 0 && <p className="products-state">No products found.</p>}
          {!loading && !error && products.length > 0 && (
            <section className="product-grid" aria-label="Products">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  inWishlist={wishlistIds.has(product._id)}
                  onToggle={handleToggle}
                  onAddToCart={handleAddToCart}
                  addingToCart={actionId === product._id}
                />
              ))}
            </section>
          )}
        </section>
      </main>
    </>
  );
}
