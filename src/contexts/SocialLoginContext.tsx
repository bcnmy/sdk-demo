import React, { useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import SocialLogin from "@biconomy/web3-auth";
import { activeChainId } from "../utils/chainConfig";

interface web3AuthContextType {
  connect: () => Promise<SocialLogin | null | undefined>;
  disconnect: () => Promise<void>;
  provider: any;
  ethersProvider: ethers.providers.Web3Provider | null;
  web3Provider: ethers.providers.Web3Provider | null;
  loading: boolean;
  chainId: number;
  address: string;
}
export const Web3AuthContext = React.createContext<web3AuthContextType>({
  connect: () => Promise.resolve(null),
  disconnect: () => Promise.resolve(),
  loading: false,
  provider: null,
  ethersProvider: null,
  web3Provider: null,
  chainId: activeChainId,
  address: "",
});
export const useWeb3AuthContext = () => useContext(Web3AuthContext);

export enum SignTypeMethod {
  PERSONAL_SIGN = "PERSONAL_SIGN",
  EIP712_SIGN = "EIP712_SIGN",
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
  chainId: activeChainId,
};

export const Web3AuthProvider = ({ children }: any) => {
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const { provider, web3Provider, ethersProvider, address, chainId } =
    web3State;
  const [loading, setLoading] = useState(false);
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(
    null
  );

  // create socialLoginSDK and call the init
  useEffect(() => {
    const initWallet = async () => {
      const sdk = new SocialLogin();
      await sdk.init({
        chainId: ethers.utils.hexValue(activeChainId).toString(),
        network: "testnet",
        whitelistUrls: {
          "https://sdk-staging.biconomy.io":
            "MEQCIBgO86Ds-nQ6JLHWmo5umziadaY-VDCQxLmwy-DX6nCxAiBJPnc0SOZmFTkphRfS7yd81DsC--Uj6Vb-WqvfSXngnQ",
          "http://sdk-staging.biconomy.io":
            "MEUCIQDW2lTR5y_sTv3UTJEhfnC3_cLDb_aBrWtev8Ih4kXG4QIgIMjQhpQs9g14c3t64bEt3mQMMPuWHrbLBfo7hRAGEZc",
          "https://sdk-dev.biconomy.io":
            "MEQCID90gUAazem-Ia_YIfVqLZr0lxo0Oawnx9ZoIcCiTtCNAiB6fZOA3AV22CDKtQ0QKYUSucPymeJoP3wmMsHZjNj-wQ",
          "http://sdk-dev.biconomy.io":
            "MEUCIQCt5ga5aLrrAjtojAZmfTFwcv9bgmTbR_VKjDTtbRf0pAIgESLgcY-tBQe1pzsawiPdEY0vQwe8ux0XDTAtBh--MRM",
        },
      });
      // sdk.showConnectModal();
      setSocialLoginSDK(sdk);
    };
    if (!socialLoginSDK) initWallet();
  }, [socialLoginSDK]);

  // if wallet already connected close widget
  useEffect(() => {
    console.log("hide wallet");
    if (socialLoginSDK && address) {
      socialLoginSDK.hideWallet();
    }
  }, [address, socialLoginSDK]);

  const connect = useCallback(async () => {
    if (address) return;
    if (socialLoginSDK?.provider) {
      setLoading(true);
      console.info("socialLoginSDK.provider", socialLoginSDK.provider);
      const web3Provider = new ethers.providers.Web3Provider(
        socialLoginSDK.provider
      );
      const signer = web3Provider.getSigner();
      const gotAccount = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      setWeb3State({
        provider: socialLoginSDK.provider,
        web3Provider: web3Provider,
        ethersProvider: web3Provider,
        address: gotAccount,
        chainId: Number(network.chainId),
      });
      setLoading(false);
      return;
    }
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();
      return socialLoginSDK;
    }
    setLoading(true);
    const sdk = new SocialLogin();
    await sdk.init({
      chainId: ethers.utils.hexValue(activeChainId).toString(),
      network: "testnet",
      whitelistUrls: {
        "https://sdk-staging.biconomy.io":
          "MEQCIBgO86Ds-nQ6JLHWmo5umziadaY-VDCQxLmwy-DX6nCxAiBJPnc0SOZmFTkphRfS7yd81DsC--Uj6Vb-WqvfSXngnQ",
        "http://sdk-staging.biconomy.io":
          "MEUCIQDW2lTR5y_sTv3UTJEhfnC3_cLDb_aBrWtev8Ih4kXG4QIgIMjQhpQs9g14c3t64bEt3mQMMPuWHrbLBfo7hRAGEZc",
        "https://sdk-dev.biconomy.io":
          "MEQCID90gUAazem-Ia_YIfVqLZr0lxo0Oawnx9ZoIcCiTtCNAiB6fZOA3AV22CDKtQ0QKYUSucPymeJoP3wmMsHZjNj-wQ",
        "http://sdk-dev.biconomy.io":
          "MEUCIQCt5ga5aLrrAjtojAZmfTFwcv9bgmTbR_VKjDTtbRf0pAIgESLgcY-tBQe1pzsawiPdEY0vQwe8ux0XDTAtBh--MRM",
      },
    });
    // sdk.showConnectModal();
    sdk.showWallet();
    setSocialLoginSDK(sdk);
    setLoading(false);
    return socialLoginSDK;
  }, [address, socialLoginSDK]);

  // after social login -> set provider info
  useEffect(() => {
    (async () => {
      if (socialLoginSDK?.provider && !address) {
        connect();
      }
    })();
  }, [address, connect, socialLoginSDK, socialLoginSDK?.provider]);

  // after metamask login -> get provider event
  useEffect(() => {
    const interval = setInterval(async () => {
      if (address) {
        clearInterval(interval);
      }
      if (socialLoginSDK?.provider && !address) {
        connect();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [address, connect, socialLoginSDK]);

  const disconnect = useCallback(async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await socialLoginSDK.logout();
    setWeb3State({
      provider: null,
      web3Provider: null,
      ethersProvider: null,
      address: "",
      chainId: activeChainId,
    });
    socialLoginSDK.hideWallet();
  }, [socialLoginSDK]);

  return (
    <Web3AuthContext.Provider
      value={{
        connect,
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
