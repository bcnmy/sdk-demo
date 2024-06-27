import { BiconomyProvider } from "@biconomy/use-aa"
import { ThemeProvider } from "@mui/styles"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import "react-toastify/dist/ReactToastify.css"
import { http, WagmiProvider, createConfig } from "wagmi"
import { polygon, polygonAmoy } from "wagmi/chains"
import App from "./App"
import "./index.css"
import { biconomyPaymasterApiKey, bundlerUrl } from "./utils/chainConfig"
import theme from "./utils/theme"

const wagmiConfig = createConfig({
  chains: [polygonAmoy, polygon],
  transports: { [polygonAmoy.id]: http(), [polygon.id]: http() }
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document?.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={true} coolMode={true}>
          <ThemeProvider theme={theme}>
            <BiconomyProvider
              config={{
                biconomyPaymasterApiKey,
                bundlerUrl
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
)
