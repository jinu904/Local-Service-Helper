import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./router";
import App from "./App";
import { AuthProvider } from "./auth";
import "./styles/style.css";
import "./styles/service.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider><App /></AuthProvider>
    </Router>
  </React.StrictMode>
);
