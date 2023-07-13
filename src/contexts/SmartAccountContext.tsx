import React, { useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { BiconomySmartAccount, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { activeChainId, bundlerUrl, paymasterApi } from "../utils/chainConfig";
import { useWeb3AuthContext } from "./SocialLoginContext";
import { Bundler } from "@biconomy/bundler";
// import { showSuccessMessage } from "../utils";

// Types
type Balance = {
  totalBalanceInUsd: number;
  alltokenBalances: any[];
};
type smartAccountContextType = {
  smartAccount: BiconomySmartAccount | null;
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
  const { provider, address } = useWeb3AuthContext();
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );
  const [scwAddress, setScwAddress] = useState("");
  const [balance, setBalance] = useState<Balance>({
    totalBalanceInUsd: 0,
    alltokenBalances: [],
  });
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSmartAccount = useCallback(async () => {
    if (!provider || !address) return "Wallet not connected";

    try {
      setLoading(true);
      const walletProvider = new ethers.providers.Web3Provider(provider);
      // create bundler and paymaster instances
      const bundler = new Bundler({
        bundlerUrl: bundlerUrl,
        chainId: activeChainId,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });
      const paymaster = new BiconomyPaymaster({
        paymasterUrl: paymasterApi,
      });
      let wallet = new BiconomySmartAccount({
        signer: walletProvider.getSigner(),
        chainId: activeChainId,
        paymaster: paymaster,
        bundler: bundler,
        // nodeClientUrl: config.nodeClientUrl, // optional
      });
      wallet = await wallet.init({
        accountIndex: 0, // optional, default value is 0
      });
      console.log("biconomyAccount", wallet);
      const scw = await wallet.getSmartAccountAddress();
      setSmartAccount(wallet);
      setScwAddress(scw);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
    }
  }, [provider, address]);

  const getSmartAccountBalance = async () => {
    if (!provider || !address) return "Wallet not connected";
    if (!smartAccount) return "Smart Account not initialized";

    try {
      setIsFetchingBalance(true);
      // ethAdapter could be used like this
      // const bal = await smartAccount.ethersAdapter().getBalance(state.address);
      const balanceParams = {
        chainId: activeChainId,
        eoaAddress: smartAccount.owner,
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
