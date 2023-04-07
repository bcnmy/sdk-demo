import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/styles";
import "react-toastify/dist/ReactToastify.css";
import "@biconomy/web3-auth/dist/src/style.css";
import { Web3AuthProvider } from "./contexts/SocialLoginContext";
import { SmartAccountProvider } from "./contexts/SmartAccountContext";
import App from "./App";
import "./index.css";
import theme from "./utils/theme";

const element = document.getElementById("root");
const root = createRoot(element!);

const Index = () => {
  return (
    <Web3AuthProvider>
      <ThemeProvider theme={theme}>
        <SmartAccountProvider>
          <App />
        </SmartAccountProvider>
      </ThemeProvider>
    </Web3AuthProvider>
  );
};

root.render(<Index />);
