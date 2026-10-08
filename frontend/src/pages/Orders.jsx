import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer, getMyOrders } from "../services/api";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Orders() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentCustomer()
      .then(() => {
        if (active) setAuthLoading(false);
      })
      .catch(() => {
        if (active) navigate("/login", { replace: true });
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(false);
    getMyOrders()
      .then((data) => {
        if (active) setOrders(data.orders ?? []);
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
  }, [authLoading]);

  function loadOrders() {
    setError(false);
    setLoading(true);
    getMyOrders()
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  if (authLoading) {
    return <main className="loading-page">Loading...</main>;
  }

  return (
    <>
      <Navbar />
      <main className="products-page">
        <section className="products-content orders-page" aria-labelledby="orders-title">
          <p className="eyebrow">Your purchases</p>
          <h1 id="orders-title">My Orders</h1>

          {loading && <p className="products-state">Loading your orders...</p>}

          {!loading && error && (
            <div className="products-state" role="alert">
              <p>Unable to load your orders.</p>
              <button type="button" className="button button-secondary" onClick={loadOrders}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="products-state">
              <p>You have not placed any orders yet.</p>
              <Link className="button" to="/products">Start Shopping</Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <section className="orders-list" aria-label="Orders">
              {orders.map((order) => (
                <article key={order._id} className="order-card">
                  <header className="order-card-header">
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </header>
                  <ul className="order-items">
                    {(order.items ?? []).map((item) => (
                      <li key={item.product}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="order-total">
                    Total: <strong>{formatPrice(order.totalAmount)}</strong>
                  </p>
                  <Link className="button button-secondary order-details-link" to={`/orders/${order._id}`}>
                    View Details
                  </Link>
                </article>
              ))}
            </section>
          )}
        </section>
      </main>
    </>
  );
}