import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.js";
import { RequesterProvider } from "./contexts/RequesterContext.js";
import { AuthProvider } from "./contexts/AuthContext.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RequesterProvider>
        <App />
      </RequesterProvider>
    </AuthProvider>
  </React.StrictMode>
);
