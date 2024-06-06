import { ThemeProvider } from "@mui/styles";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { polygonAmoy, polygon } from "wagmi/chains";
import App from "./App";
import "./index.css";
import theme from "./utils/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BiconomyProvider } from "@biconomy/use-aa";
import { bundlerUrl, paymasterApiKey } from "./utils/chainConfig";

const wagmiConfig = createConfig({
  chains: [polygonAmoy, polygon],
  transports: { [polygonAmoy.id]: http(), [polygon.id]: http() },
});

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document?.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={true} coolMode={true}>
          <ThemeProvider theme={theme}>
            <BiconomyProvider
              config={{
                paymasterApiKey,
                bundlerUrl,
              }}
              queryClient={queryClient}
            >
              <App />
            </BiconomyProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
