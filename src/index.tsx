import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/styles";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from 'wagmi';
import { polygonMumbai, polygon } from "wagmi/chains";
import { SmartAccountProvider } from "./contexts/SmartAccountContext";
import App from "./App";
import "./index.css";
import theme from "./utils/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const element = document.getElementById("root");
const root = createRoot(element!);

const wagmiConfig = createConfig({
  chains: [polygonMumbai, polygon],
  transports: {[polygonMumbai.id]: http(), [polygon.id]: http()}
});

const queryClient = new QueryClient() 


const Index = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={true}
          coolMode={true}
        >
          <ThemeProvider theme={theme}>
            <SmartAccountProvider>
              <App />
            </SmartAccountProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider> 
    </WagmiProvider>
  );
};

root.render(<Index />);
