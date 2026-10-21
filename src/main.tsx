import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PlasmaBackdrop } from "./components/PlasmaBackdrop";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlasmaBackdrop />
    <App />
  </StrictMode>,
);
