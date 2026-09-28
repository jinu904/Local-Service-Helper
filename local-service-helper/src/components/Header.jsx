import { Link } from "../router";

export default function Header() {
  return (
    <header>
      <div className="navbar">
        <h1>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Local Service Helper
          </Link>
        </h1>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#how-it-works">How It Works</Link>
          <Link to="/#about">About</Link>
          <Link to="/#contact">Contact</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>
    </header>
  );
}
