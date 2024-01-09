import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  BiconomyAccountProvider,
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy-devx/account";
import { BiconomyPaymaster } from "@biconomy-devx/paymaster";
import { useAccount, useWalletClient } from "wagmi";
import { activeChainId, bundlerUrl, paymasterApi } from "../utils/chainConfig";
import { Bundler } from "@biconomy-devx/bundler";
import { MultiChainValidationModule } from "@biconomy-devx/modules";
import { WalletClientSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
// import { useEthersSigner } from './ethers'

// Types
type smartAccountContextType = {
  smartAccount: BiconomySmartAccountV2 | null;
  accountProvider: BiconomyAccountProvider | null;
  scwAddress: string;
  loading: boolean;
  getSmartAccount: () => void;
};

// Context
export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    smartAccount: null,
    accountProvider: null,
    scwAddress: "",
    loading: false,
    getSmartAccount: () => 0,
  }
);
export const useSmartAccountContext = () => useContext(SmartAccountContext);

// Provider
export const SmartAccountProvider = ({ children }: any) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [accountProvider, setAccountProvider] =
    useState<BiconomyAccountProvider | null>(null);
  const [scwAddress, setScwAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const getSmartAccount = useCallback(async () => {
    if (!walletClient || !address) return "Wallet not connected";

    try {
      setLoading(true);
      // create bundler and paymaster instances
      const bundler = new Bundler({
        bundlerUrl: bundlerUrl,
        chainId: activeChainId,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });
      const paymaster = new BiconomyPaymaster({
        paymasterUrl: paymasterApi,
      });
      let signer = new WalletClientSigner(walletClient, "json-rpc");
      // create multiChainModule
      const multiChainModule = await MultiChainValidationModule.create({
        signer: signer,
        moduleAddress: "0x000000824dc138db84FD9109fc154bdad332Aa8E",
      });
      let wallet = await BiconomySmartAccountV2.create({
        chainId: activeChainId,
        paymaster: paymaster,
        bundler: bundler,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: multiChainModule,
        activeValidationModule: multiChainModule,
      });
      setSmartAccount(wallet);

      const scw = await wallet.getAccountAddress();
      setScwAddress(scw);

      const smartAccountProvider = new BiconomyAccountProvider({
        rpcProvider: polygonMumbai.rpcUrls.default.http[0],
        chain: polygonMumbai,
      }).connect((_rpcClient: any) => wallet);
      setAccountProvider(smartAccountProvider);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
    }
  }, [walletClient, address]);

  useEffect(() => {
    getSmartAccount();
  }, [getSmartAccount]);

  return (
    <SmartAccountContext.Provider
      value={{
        scwAddress,
        smartAccount,
        loading,
        getSmartAccount,
        accountProvider,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
