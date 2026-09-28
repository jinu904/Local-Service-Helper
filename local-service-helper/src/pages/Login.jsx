import { useEffect, useState } from "react";
import { Link, navigate } from "../router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    document.title = "Login - Local Service Helper";
  }, []);

  const handleSubmit = (e) => {
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

    alert("Login successful!");
    navigate("/");
  };

  return (
    <>
      <Header />
      <main>
        <section className="login-section">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Login to Local Service Helper</p>
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

              <button type="submit">Login</button>
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
