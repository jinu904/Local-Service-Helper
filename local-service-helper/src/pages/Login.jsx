import { useEffect, useState } from "react";
import { Link, navigate } from "../router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../api";
import { useAuth } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    document.title = "Login - Fixnear";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === "") {
      alert("Please enter your email address.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password === "") {
      alert("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    setBusy(true); setError("");
    try {
      const result = await login(email, password);
      signIn(result.user, result.token);
      navigate(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Header />
      <main>
        <section className="login-section">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Login to Fixnear</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember Me
                </label>
                <a
                  href="#/login"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset is not available in this demo.");
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {error && <p className="form-error">{error}</p>}
              <button type="submit" disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
            </form>

            <div className="login-register">
              <p>
                Don't have an account? <Link to="/register">Register Now</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
