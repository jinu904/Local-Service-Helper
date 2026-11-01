import { Link } from "../router";

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div>
          <h3><span className="brand-mark">⌂</span> Fixnear</h3>
          <p>Trusted help for every corner of your home.</p>
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

