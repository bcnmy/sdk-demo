import React, { useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import WalletLink from "walletlink";

interface web3ContextType {
  connectWeb3: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: any;
  ethersProvider: ethers.providers.Web3Provider | null;
  web3Provider: ethers.providers.Web3Provider | null;
  loading: boolean;
  chainId: number;
  address: string;
}

export const Web3Context = React.createContext<web3ContextType>({
  connectWeb3: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  loading: false,
  provider: null,
  ethersProvider: null,
  web3Provider: null,
  chainId: 0,
  address: "",
});

export const useWeb3Context = () => useContext(Web3Context);

const INFURA_ID = "5ead597854fc415d97a3626c3fa39fb3";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
  "custom-walletlink": {
    display: {
      logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
      name: "Coinbase",
      description: "Connect to Coinbase Wallet (not Coinbase App)",
    },
    options: {
      appName: "Coinbase",
      networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 1,
    },
    package: WalletLink,
    connector: async (
      _: any,
      options: { appName: any; networkUrl: any; chainId: any }
    ) => {
      const { appName, networkUrl, chainId } = options;
      const walletLink = new WalletLink({
        appName,
      });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },
};

let web3Modal: Web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions,
  });
}

type StateType = {
  provider?: any;
  web3Provider?: ethers.providers.Web3Provider | null;
  ethersProvider?: ethers.providers.Web3Provider | null;
  address?: string;
  chainId?: number;
};

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  ethersProvider: null,
  address: "",
  chainId: 1,
};

export const Web3Provider = ({ children }: any) => {
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const { provider, web3Provider, ethersProvider, address, chainId } =
    web3State;
  const [loading, setLoading] = useState(true);

  const connectWeb3 = useCallback(async () => {
    try {
      setLoading(true);
      const modalProvider = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(modalProvider);
      const signer = web3Provider.getSigner();
      const gotAccount = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      setWeb3State({
        provider: modalProvider,
        web3Provider: web3Provider,
        ethersProvider: web3Provider,
        address: gotAccount,
        chainId: Number(network.chainId),
      });
      setLoading(false);
    } catch (error) {
      console.log({ web3ModalError: error });
    }
    setLoading(false);
  }, []);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    if (provider?.disconnect && typeof provider.disconnect === "function") {
      await provider.disconnect();
    }
    setWeb3State({
      provider: null,
      web3Provider: null,
      ethersProvider: null,
      address: "",
      chainId: 0,
    });
  }, [provider]);

  useEffect(() => {
    console.log(chainId);
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = true;
    }
    if (web3Modal.cachedProvider) {
      connectWeb3();
    } else {
      setLoading(false);
    }
  }, [chainId, connectWeb3]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("accountsChanged", accounts);
        setWeb3State((prevState) => ({
          ...prevState,
          address: accounts[0],
        }));
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      // const handleChainChanged = (_hexChainId: string) => {
      //   window.location.reload();
      // };

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      // provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          // provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return (
    <Web3Context.Provider
      value={{
        connectWeb3,
        disconnect,
        loading,
        provider: provider,
        ethersProvider: ethersProvider || null,
        web3Provider: web3Provider || null,
        chainId: chainId || 0,
        address: address || "",
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
