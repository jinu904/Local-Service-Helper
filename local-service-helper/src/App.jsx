import { usePath, Link } from "./router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ServicePage from "./pages/ServicePage";
import Dashboard from "./pages/Dashboard";
import ProviderProfile from "./pages/ProviderProfile";

function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="service-hero">
          <div className="service-hero-content">
            <h2>Page not found</h2>
            <p>
              <Link to="/">Go back home</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const path = usePath();
  const service = path.match(/^\/services\/([\w-]+)\/?$/);
  const provider = path.match(/^\/providers\/(\d+)\/?$/);

  if (path === "/") return <Home />;
  if (path === "/login") return <Login />;
  if (path === "/register") return <Register />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/admin") return <Dashboard admin />;
  if (provider) return <ProviderProfile id={provider[1]} />;
  if (service) return <ServicePage key={service[1]} slug={service[1]} />;
  return <NotFound />;
}
