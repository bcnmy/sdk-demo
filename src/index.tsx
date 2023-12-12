import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/styles";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { SmartAccountProvider } from "./contexts/SmartAccountContext";
import App from "./App";
import "./index.css";
import theme from "./utils/theme";

const element = document.getElementById("root");
const root = createRoot(element!);

const { chains, publicClient } = configureChains(
  [polygonMumbai, polygon],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "Biconomy SDK Demo",
  projectId: "YOUR_PROJECT_ID",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const Index = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        showRecentTransactions={true}
        coolMode={true}
      >
        <ThemeProvider theme={theme}>
          <SmartAccountProvider>
            <App />
          </SmartAccountProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

root.render(<Index />);
