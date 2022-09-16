export const ChainId = {
  MAINNET: 1, // Ethereum
  GOERLI: 5,
  POLYGON_MUMBAI: 80001,
  POLYGON_MAINNET: 137,
};

export let activeChainId = ChainId.GOERLI;
export const supportedChains = [ChainId.GOERLI, ChainId.POLYGON_MUMBAI];

export const getSupportedChains = () => {};
