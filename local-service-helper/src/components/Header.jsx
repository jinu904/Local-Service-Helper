import { Link } from "../router";
import { navigate } from "../router";
import { useAuth } from "../auth";

export default function Header() {
  const { user, signOut } = useAuth();
  return (
    <header>
      <div className="navbar">
        <h1>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            <span className="brand-mark">⌂</span> Fixnear
          </Link>
        </h1>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#how-it-works">How It Works</Link>
          <Link to="/#about">About</Link>
          <Link to="/#contact">Contact</Link>
          {user ? <>
            <span className="account-chip">Hi, {user.name.split(" ")[0]}</span>
            <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>My dashboard</Link>
            <button className="nav-logout" type="button" onClick={() => { signOut(); navigate("/"); }}>Log out</button>
          </> : <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>}
        </nav>
      </div>
    </header>
  );
}

