import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading) {
    return <main className="loading-page">Loading your account...</main>;
  }

  if (!customer) return null;

  return (
    <main className="home-page">
      <Navbar />
      <section className="profile-card" aria-labelledby="home-title">
        <p className="eyebrow">Your account</p>
        <h1 id="home-title">Welcome, {customer.fullName}!</h1>
        <p className="subtext">Here are your ShopKart account details.</p>
        <dl className="profile-details">
          <div><dt>Customer name</dt><dd>{customer.fullName}</dd></div>
          <div><dt>Email</dt><dd>{customer.email}</dd></div>
          <div><dt>Phone number</dt><dd>{customer.phone}</dd></div>
        </dl>
      </section>
    </main>
  );
}
