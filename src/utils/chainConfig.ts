import { polygonAmoy } from "viem/chains"
export const ChainId = {
  MAINNET: 1, // Ethereum
  GOERLI: 5,
  POLYGON_AMOY: 80002,
  POLYGON_MAINNET: 137,
  ARBITRUM_GOERLI: 421613
}

export const activeChainId = ChainId.POLYGON_AMOY
export const biconomyPaymasterApiKey = import.meta.env.PAYMASTER_KEY
export const bundlerUrl = import.meta.env.BUNDLER_URL

console.log({ biconomyPaymasterApiKey, bundlerUrl })

export const supportedChains = [
  ChainId.GOERLI,
  ChainId.POLYGON_MAINNET,
  ChainId.POLYGON_AMOY,
  ChainId.ARBITRUM_GOERLI
]

// Basic Abi session Validation Module
export const CONTRACT_CALL_SESSION_VALIDATION_MODULE =
  "0x61b5F31bdb68eE54D6319cEc5b53Fac764E2d309"

export const getRPCProvider = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "https://eth-mainnet.g.alchemy.com/v2/YMRFBPG1iyBwiRQIHThSWZanZj0NXUjv"
    case 5:
      return "https://eth-goerli.alchemyapi.io/v2/lmW2og_aq-OXWKYRoRu-X6Yl6wDQYt_2"
    case 80002:
      return polygonAmoy.rpcUrls.default.http[0]
    case 137:
      return "https://polygon.llamarpc.com"
    default:
      return "https://eth-mainnet.g.alchemy.com/v2/YMRFBPG1iyBwiRQIHThSWZanZj0NXUjv"
  }
}

export const getExplorer = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "https://etherscan.io"
    case 5:
      return "https://goerli.etherscan.io"
    case 80002:
      return polygonAmoy.blockExplorers.default.url
    case 137:
      return "https://polygonscan.com"
    case 421613:
      return "https://goerli.arbiscan.io/"
    default:
      return polygonAmoy.blockExplorers.default.url
  }
}
