import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentCustomer, logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    let active = true;
    getCurrentCustomer()
      .then((profile) => {
        if (active) setCustomer(profile);
      })
      .catch(() => {
        if (active) setCustomer(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutCustomer();
      setCustomer(null);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to={customer ? "/home" : "/login"}>
        ShopKart
      </Link>
      <div className="navbar-actions">
        <Link className="products-link" to="/products">Products</Link>
        {customer && <Link className="wishlist-link" to="/wishlist">Wishlist</Link>}
        {customer && <Link className="orders-link" to="/orders">My Orders</Link>}
        {customer && <Link className="cart-link" to="/cart">Cart ({cartCount})</Link>}
        {customer ? (
          <button type="button" className="button button-secondary" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        ) : (
          <>
            <Link className="button button-secondary auth-nav-link" to="/login">Log in</Link>
            <Link className="button button-secondary auth-nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
