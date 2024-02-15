import React, { useCallback, useContext, useEffect, useState } from "react";
import { BiconomySmartAccountV2, createSmartAccountClient } from "@biconomy/account";
import { useAccount, useWalletClient } from "wagmi";
import { bundlerUrl, paymasterApiKey } from "../utils/chainConfig";
// import { MultiChainValidationModule } from "@biconomy/account";

// Types
type smartAccountContextType = {
  smartAccount: BiconomySmartAccountV2 | null;
  scwAddress: string;
  loading: boolean;
  getSmartAccount: () => void;
};

// Context
export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    smartAccount: null,
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
  const [scwAddress, setScwAddress] = useState("");
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
      let wallet = await createSmartAccountClient({
        biconomyPaymasterApiKey: paymasterApiKey, 
        bundlerUrl: bundlerUrl,
        signer: walletClient as any, // type issue
      });
      setSmartAccount(wallet);

      const scw = await wallet.getAccountAddress();
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
