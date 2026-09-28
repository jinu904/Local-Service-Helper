import { useEffect, useState } from "react";
import { Link, navigate } from "../router";
import Header from "../components/Header";
import Footer from "../components/Footer";

const emptyForm = { fullname: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    document.title = "Register - Local Service Helper";
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.fullname.trim() === "") {
      alert("Please enter your full name.");
      return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (form.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }
    if (!terms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    alert("Registration successful!");
    navigate("/login");
  };

  return (
    <>
      <Header />
      <main>
        <section className="register-section">
          <div className="register-card">
            <div className="register-header">
              <h2>Create an Account</h2>
              <p>Join Local Service Helper today</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="fullname">Full Name</label>
              <input
                type="text"
                id="fullname"
                placeholder="Enter your full name"
                value={form.fullname}
                onChange={update("fullname")}
                required
              />

              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={update("email")}
                required
              />

              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={update("phone")}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={form.password}
                onChange={update("password")}
                required
              />

              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                required
              />

              <label className="terms">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
                I agree to the terms and conditions
              </label>

              <button type="submit">Create Account</button>
            </form>

            <div className="register-login">
              <p>
                Already have an account? <Link to="/login">Login Now</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
