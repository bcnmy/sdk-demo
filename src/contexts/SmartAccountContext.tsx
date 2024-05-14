import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  BiconomySmartAccountV2,
  Hex,
  createSmartAccountClient,
} from "@biconomy/account";
import { useAccount, useWalletClient } from "wagmi";
import { bundlerUrl, paymasterApiKey } from "../utils/chainConfig";
// import { MultiChainValidationModule } from "@biconomy/account";

// Types
type smartAccountContextType = {
  smartAccount: BiconomySmartAccountV2 | null;
  scwAddress: Hex;
  loading: boolean;
  getSmartAccount: () => void;
};

// Context
export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    smartAccount: null,
    scwAddress: "0x" as Hex,
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
  const [scwAddress, setScwAddress] = useState<Hex>("0x");
  const [loading, setLoading] = useState(false);

  const getSmartAccount = useCallback(async () => {
    if (!walletClient || !address) return "Wallet not connected";

    try {
      setLoading(true);
      // create multiChainModule
      /*const multiChainModule = await MultiChainValidationModule.create({
        signer: walletClient,
        moduleAddress: "0x000000824dc138db84FD9109fc154bdad332Aa8E",
      });*/

      console.log({ paymasterApiKey, bundlerUrl, walletClient });

      let wallet = await createSmartAccountClient({
        biconomyPaymasterApiKey: paymasterApiKey,
        bundlerUrl: bundlerUrl,
        signer: walletClient,
      });

      setSmartAccount(wallet);

      const scw = (await wallet.getAccountAddress()) as Hex;
      setScwAddress(scw);

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
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
