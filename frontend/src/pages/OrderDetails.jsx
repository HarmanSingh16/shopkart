import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer, getMyOrder } from "../services/api";

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

function statusClass(status) {
  const map = {
    PENDING_PAYMENT: "status-badge status-pending",
    PLACED: "status-badge status-placed",
    CONFIRMED: "status-badge status-confirmed",
    SHIPPED: "status-badge status-shipped",
    DELIVERED: "status-badge status-delivered",
    PENDING: "status-badge status-pending",
    PAID: "status-badge status-paid",
    FAILED: "status-badge status-failed",
  };
  return map[status] || "status-badge";
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [authLoading, setAuthLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
    setNotFound(false);
    setError(false);

    getMyOrder(id)
      .then((data) => {
        if (active) setOrder(data.order);
      })
      .catch((err) => {
        if (!active) return;
        if (err.message && /not found/i.test(err.message)) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, authLoading]);

  function loadOrder() {
    setError(false);
    setLoading(true);
    getMyOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => {
        if (err.message && /not found/i.test(err.message)) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }

  if (authLoading) {
    return <main className="loading-page">Loading...</main>;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="products-page">
          <p className="products-state">Loading order...</p>
        </main>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="products-page">
          <section className="products-content">
            <p className="products-state" role="alert">Order not found.</p>
            <Link className="button button-secondary" to="/orders">Back to My Orders</Link>
          </section>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="products-page">
          <section className="products-content">
            <p className="products-state" role="alert">Unable to load this order.</p>
            <button type="button" className="button button-secondary" onClick={loadOrder}>
              Try Again
            </button>
          </section>
        </main>
      </>
    );
  }

  const justPlaced = order.status === "PLACED" && order.paymentStatus === "PAID";

  return (
    <>
      <Navbar />
      <main className="products-page">
        <section className="products-content order-details-page" aria-labelledby="order-title">
          {justPlaced && (
            <p className="order-success">✅ Order Placed Successfully</p>
          )}
          <p className="eyebrow">Order details</p>
          <h1 id="order-title">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="order-meta">Placed on {formatDate(order.createdAt)}</p>

          <p className="order-status-row">
            Status: <span className={statusClass(order.status)}>{order.status}</span>
            <span className={statusClass(order.paymentStatus)}>Payment: {order.paymentStatus}</span>
          </p>

          <section className="order-summary" aria-label="Items">
            <h2>Items</h2>
            {(order.items ?? []).map((item) => (
              <div key={item.product} className="order-item-row">
                <img className="order-item-image" src={item.image} alt={item.name} />
                <div className="order-item-content">
                  <p className="order-item-name">{item.name}</p>
                  <p>
                    {item.quantity} × {formatPrice(item.price)} ={" "}
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </p>
                </div>
              </div>
            ))}
            <p className="order-total">
              Total: <strong>{formatPrice(order.totalAmount)}</strong>
            </p>
          </section>

          <section className="order-summary" aria-label="Shipping address">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
              {order.shippingAddress?.pincode}
            </p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </section>

          {justPlaced && (
            <div className="order-details-actions">
              <Link className="button button-secondary" to="/orders">View My Orders</Link>
              <Link className="button" to="/products">Continue Shopping</Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}