import { Link } from "../router";

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div>
          <h3>Local Service Helper</h3>
          <p>Making local services easier to find and book.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#about">About</Link>
          <Link to="/#contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
