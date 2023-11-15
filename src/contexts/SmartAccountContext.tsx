import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { useAccount } from 'wagmi'
import { activeChainId, bundlerUrl, paymasterApi } from "../utils/chainConfig";
import { Bundler } from "@biconomy/bundler";
import { MultiChainValidationModule } from "@biconomy/modules";
import { useEthersSigner } from './ethers'

// Types
type Balance = {
  totalBalanceInUsd: number;
  alltokenBalances: any[];
};
type smartAccountContextType = {
  smartAccount: BiconomySmartAccountV2 | null;
  scwAddress: string;
  balance: Balance;
  loading: boolean;
  isFetchingBalance: boolean;
  getSmartAccount: () => void;
  getSmartAccountBalance: () => void;
};

// Context
export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    smartAccount: null,
    scwAddress: "",
    balance: {
      totalBalanceInUsd: 0,
      alltokenBalances: [],
    },
    loading: false,
    isFetchingBalance: false,
    getSmartAccount: () => 0,
    getSmartAccountBalance: () => 0,
  }
);
export const useSmartAccountContext = () => useContext(SmartAccountContext);

// Provider
export const SmartAccountProvider = ({ children }: any) => {
  const { address } = useAccount()
  const signer = useEthersSigner()
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [scwAddress, setScwAddress] = useState("");
  const [balance, setBalance] = useState<Balance>({
    totalBalanceInUsd: 0,
    alltokenBalances: [],
  });
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSmartAccount = useCallback(async () => {
    if (!signer || !address) return "Wallet not connected";

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
      wallet = await wallet.init();
      console.log("biconomyAccount", wallet);
      const scw = await wallet.getAccountAddress();
      setSmartAccount(wallet);
      setScwAddress(scw);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
    }
  }, [signer, address]);

  const getSmartAccountBalance = async () => {
    if (!signer || !address) return "Wallet not connected";
    if (!smartAccount) return "Smart Account not initialized";

    try {
      setIsFetchingBalance(true);
      // ethAdapter could be used like this
      // const bal = await smartAccount.ethersAdapter().getBalance(state.address);
      const balanceParams = {
        chainId: activeChainId,
        address: await smartAccount.getAccountAddress(),
        tokenAddresses: [],
      };
      const balFromSdk = await smartAccount.getAllTokenBalances(balanceParams);
      console.info("getAlltokenBalances", balFromSdk);

      const usdBalFromSdk = await smartAccount.getTotalBalanceInUsd(
        balanceParams
      );
      console.info("getTotalBalanceInUsd", usdBalFromSdk);
      setBalance({
        totalBalanceInUsd: usdBalFromSdk.data.totalBalance,
        alltokenBalances: balFromSdk.data,
      });
      setIsFetchingBalance(false);
      return "";
    } catch (error: any) {
      setIsFetchingBalance(false);
      console.error(error);
      return error.message;
    }
  };

  useEffect(() => {
    getSmartAccount();
  }, [getSmartAccount]);

  return (
    <SmartAccountContext.Provider
      value={{
        scwAddress,
        smartAccount,
        balance,
        loading,
        isFetchingBalance,
        getSmartAccount,
        getSmartAccountBalance,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
