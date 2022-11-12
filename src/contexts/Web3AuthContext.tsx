import React, { useCallback, useContext, useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { CoinbaseAdapter } from "@web3auth/coinbase-adapter";
import { ethers } from "ethers";
import { activeChainId, getRPCProvider } from "../utils/chainConfig";

interface web3AuthContextType {
  connectWeb3: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: any;
  ethersProvider: ethers.providers.Web3Provider | null;
  web3Provider: ethers.providers.Web3Provider | null;
  loading: boolean;
  chainId: number;
  address: string;
}

export const Web3AuthContext = React.createContext<web3AuthContextType>({
  connectWeb3: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  loading: false,
  provider: null,
  ethersProvider: null,
  web3Provider: null,
  chainId: activeChainId,
  address: "",
});

export const useWeb3AuthContext = () => useContext(Web3AuthContext);

const CLIENT_ID =
  "BEQgHQ6oRgaJXc3uMnGIr-AY-FLTwRinuq8xfgnInrnDrQZYXxDO0e53osvXzBXC1dcUTyD2Itf-zN1VEB8xZlo"; // TODO: in env

const web3auth = new Web3Auth({
  clientId: CLIENT_ID,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: ethers.utils.hexValue(activeChainId),
    rpcTarget: getRPCProvider(activeChainId),
  },
});
const coinbaseAdapter = new CoinbaseAdapter({
  clientId: "YOUR_WEB3AUTH_CLIENT_ID",
});
web3auth.configureAdapter(coinbaseAdapter);
web3auth.initModal();

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
  chainId: activeChainId,
};

export const Web3AuthProvider = ({ children }: any) => {
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const { provider, web3Provider, ethersProvider, address, chainId } =
    web3State;
  const [loading, setLoading] = useState(true);

  const connectWeb3 = useCallback(async () => {
    try {
      setLoading(true);
      const modalProvider = await web3auth.connect();
      console.info("web3AuthProvider", modalProvider);
      if (!modalProvider) return;
      const web3Provider = new ethers.providers.Web3Provider(modalProvider);
      const signer = web3Provider.getSigner();
      const gotAccount = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      console.info("EOA Address", gotAccount);
      setWeb3State({
        provider: modalProvider,
        web3Provider: web3Provider,
        ethersProvider: web3Provider,
        address: gotAccount,
        chainId: Number(network.chainId),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error({ web3AuthError: error });
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (web3auth) {
      await web3auth.logout();
    }
    setWeb3State({
      provider: null,
      web3Provider: null,
      ethersProvider: null,
      address: "",
      chainId: activeChainId,
    });
  }, []);

  useEffect(() => {
    if (web3auth.provider) {
      console.log(web3auth.provider);
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
    <Web3AuthContext.Provider
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
    </Web3AuthContext.Provider>
  );
};
