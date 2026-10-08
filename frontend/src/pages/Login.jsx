import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { loginCustomer } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await loginCustomer(form);
      navigate("/home");
    } catch {
      setErrors({ form: "Invalid Credentials" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Log in to ShopKart</h1>
          <p className="subtext">Enter your details to view your account.</p>
          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
            {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="auth-link">New to ShopKart? <Link to="/register">Create an account</Link></p>
        </section>
      </main>
    </>
  );
}
