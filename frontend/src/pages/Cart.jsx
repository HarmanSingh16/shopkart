import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { getCurrentCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Cart() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    cartItems,
    cartLoading,
    cartError,
    subtotal,
    actionId,
    refreshCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

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

  async function handleUpdate(productId, nextQuantity) {
    try {
      await updateQuantity(productId, nextQuantity);
    } catch {
      await refreshCart();
    }
  }

  async function handleRemove(productId) {
    try {
      await removeFromCart(productId);
    } catch {
      await refreshCart();
    }
  }

  function handleCheckout() {
    navigate("/checkout");
  }

  if (authLoading) {
    return <main className="loading-page">Loading your account...</main>;
  }

  if (!customer) return null;

  const totalUnits = cartItems.reduce((n, i) => n + i.quantity, 0);

  return (
    <main className="home-page">
      <Navbar />
      <section className="products-content cart-page" aria-labelledby="cart-title">
        <p className="eyebrow">Ready to check out</p>
        <h1 id="cart-title">My Cart</h1>

        {cartLoading && <p className="products-state">Loading your cart...</p>}

        {!cartLoading && cartError && (
          <div className="products-state" role="alert">
            <p>Unable to load your cart.</p>
            <button type="button" className="button button-secondary" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        )}

        {!cartLoading && !cartError && cartItems.length === 0 && (
          <div className="products-state">
            <p>Your cart is empty 🛒</p>
            <p>Looks like you haven't added anything yet.</p>
            <Link className="button" to="/products">Browse Products</Link>
          </div>
        )}

        {!cartLoading && !cartError && cartItems.length > 0 && (
          <>
            <section className="product-grid" aria-label="Cart items">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  onIncrement={handleUpdate}
                  onDecrement={handleUpdate}
                  onRemove={handleRemove}
                  busy={actionId === item.product._id}
                />
              ))}
            </section>

            <div className="order-summary" aria-label="Order summary">
              <h2>Order Summary</h2>
              <p>Items: <strong>{totalUnits}</strong></p>
              <p>Subtotal: <strong>{formatPrice(subtotal)}</strong></p>
              <button type="button" className="button checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}