// Tiny hash-based router. Using the URL hash (#/services/plumbing) means the
// app works when index.html is simply opened in a browser (file://) as well as
// on any static host, with no server rewrites and no extra dependencies.
import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

const RouterContext = createContext("/");
let pendingSection = null;

const readPath = () => {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
};

const scrollToSection = (id) => {
  const el = id && document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo(0, 0);
};

export function navigate(to) {
  const [path, section] = to.split("#");
  const target = path || "/";
  pendingSection = section || null;
  if (target === readPath()) {
    // same page: just scroll (hashchange would not fire)
    scrollToSection(pendingSection);
    pendingSection = null;
  } else {
    window.location.hash = target;
  }
}

export function Router({ children }) {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Runs after the new page has mounted: jump to a section or back to the top.
  useLayoutEffect(() => {
    if (pendingSection) {
      const id = pendingSection;
      pendingSection = null;
      window.scrollTo(0, 0);
      requestAnimationFrame(() => scrollToSection(id));
    } else {
      window.scrollTo(0, 0);
    }
  }, [path]);

  return <RouterContext.Provider value={path}>{children}</RouterContext.Provider>;
}

export const usePath = () => useContext(RouterContext);

export function Link({ to, children, ...rest }) {
  const [path] = to.split("#");
  return (
    <a
      href={`#${path || "/"}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
