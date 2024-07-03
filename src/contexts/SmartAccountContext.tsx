import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { bundlerUrl, paymasterApiKey } from "../utils/chainConfig";
import { NexusSmartAccount, createSmartAccountClient } from "@biconomy/account";
import { Address } from "viem";
import { detectModulByAddress } from "../utils";
// import { MultiChainValidationModule } from "@biconomy/account";

// Types
type smartAccountContextType = {
  smartAccount: NexusSmartAccount | null;
  scwAddress: string;
  loading: boolean;
  installedModules: {address: Address, moduleName: string, type: string}[];
  getSmartAccount: () => void;
};

// Context
export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    smartAccount: null,
    scwAddress: "",
    loading: false,
    installedModules: [],
    getSmartAccount: () => 0,
  }
);
export const useSmartAccountContext = () => useContext(SmartAccountContext);

// Provider
export const SmartAccountProvider = ({ children }: any) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [smartAccount, setSmartAccount] =
    useState<NexusSmartAccount | null>(null);
  const [scwAddress, setScwAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [installedModules, setInstalledModules] = useState<{address: Address, moduleName: string, type: string}[]>([]);

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
        bundlerUrl: bundlerUrl,
        signer: walletClient as any, // type issue
        paymasterUrl: "https://paymaster.biconomy.io/api/v1/84532/1SiNJ1OW7.e15b6f41-5ed4-493a-af6f-b3b40c17f856"
      });
      setSmartAccount(wallet);

      const scw = await wallet.getAccountAddress();
      setScwAddress(scw);

      const installedValidators: Address[] = await wallet.getInstalledValidators();
      console.log(installedValidators, "installedValidators");
      const installedExecutors: Address[] = await wallet.getInstalledExecutors();
      console.log(installedExecutors, "installedExecutors");
      const formattedArray = [...installedValidators.map((validator) => {
        return {address: validator, moduleName: detectModulByAddress(validator)!.name, type: detectModulByAddress(validator)!.type}
      }), ...installedExecutors.map((executor) => {
        return {address: executor, moduleName: detectModulByAddress(executor)!.name, type: detectModulByAddress(executor)!.type}
      })]
      console.log(formattedArray, "formattedArray");
      setInstalledModules(formattedArray)

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
    }
  }, [walletClient, address]);

  useEffect(() => {
    console.log("In use effect");
    getSmartAccount();
  }, [getSmartAccount]);

  return (
    <SmartAccountContext.Provider
      value={{
        scwAddress,
        smartAccount,
        loading,
        getSmartAccount,
        installedModules
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
