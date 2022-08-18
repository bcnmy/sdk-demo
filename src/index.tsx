import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { Web3Provider } from "./contexts/Web3Context";
import { SmartAccountProvider } from "./contexts/SmartAccountContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Web3Provider>
    <SmartAccountProvider>
      <App />
    </SmartAccountProvider>
  </Web3Provider>
);
