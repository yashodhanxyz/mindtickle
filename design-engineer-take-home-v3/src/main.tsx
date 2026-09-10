import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { getOptionPage } from "./pages";
import "./styles.css";
import "./assistant.css";

const page = getOptionPage(window.location.pathname);
document.title = "Aria Sales Hub · " + page.title;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App layout={page.layout} />
  </StrictMode>,
);
