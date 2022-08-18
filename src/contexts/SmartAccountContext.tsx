import React, { useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import SmartAccount from "@biconomy-sdk/smart-account";
import { SmartAccountState } from "@biconomy-sdk/core-types";
import { ChainId } from "../utils";
import { useWeb3Context } from "./Web3Context";

type Balance = {
  totalBalanceInUsd: number;
  alltokenBalances: any[];
};

interface smartAccountContextType {
  wallet: SmartAccount | null;
  state: SmartAccountState | null;
  balance: Balance;
  loading: boolean;
  isFetchingBalance: boolean;
  getSmartAccount: () => Promise<string>;
  getSmartAccountBalance: () => Promise<string>;
}

export const SmartAccountContext = React.createContext<smartAccountContextType>(
  {
    wallet: null,
    state: null,
    balance: {
      totalBalanceInUsd: 0,
      alltokenBalances: [],
    },
    loading: false,
    isFetchingBalance: false,
    getSmartAccount: () => Promise.resolve(""),
    getSmartAccountBalance: () => Promise.resolve(""),
  }
);

export const useSmartAccountContext = () => useContext(SmartAccountContext);

export const SmartAccountProvider = ({ children }: any) => {
  const { provider, address } = useWeb3Context();
  const [wallet, setWallet] = useState<SmartAccount | null>(null);
  const [state, setState] = useState<SmartAccountState | null>(null);
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

      // New instance
      const wallet = new SmartAccount(walletProvider, {
        // these are all optional
        activeNetworkId: ChainId.GOERLI,
        supportedNetworksIds: [ChainId.GOERLI, ChainId.POLYGON_MUMBAI],
      });

      // Initalising
      const smartAccount = await wallet.init();
      setWallet(wallet);
      console.log("smartAccount", smartAccount);

      // can get counter factual wallet address
      // const address = await smartAccount.getAddress();
      // console.log("counter factual wallet address: ", address);

      // get address, isDeployed and other data
      const state = await smartAccount.getSmartAccountState();
      setState(state);
      console.log("getSmartAccountState", state);

      // Check if the smart wallet is deployed or not
      // const isDeployed = await smartAccount.isDeployed(); // can pass chainId here
      // console.log(isDeployed);
      setLoading(false);
      return "";
    } catch (error: any) {
      setLoading(false);
      console.log({ smartAccountError: error });
      return error.message;
    }
  }, [provider, address]);

  const getSmartAccountBalance = async () => {
    if (!provider || !address) return "Wallet not connected";
    if (!state || !wallet) return "Init Smart Account First";

    try {
      setIsFetchingBalance(true);
      // ethAdapter could be used like this
      // const bal = await wallet.ethersAdapter().getBalance(state.address);
      // console.log(bal);
      // you may use EOA address my goerli SCW 0x1927366dA53F312a66BD7D09a88500Ccd16f175e
      const balanceParams = {
        chainId: 5,
        eoaAddress: state.address,
        tokenAddresses: [],
      };
      const balFromSdk = await wallet.getAlltokenBalances(balanceParams);
      console.log(balFromSdk);

      const usdBalFromSdk = await wallet.getTotalBalanceInUsd(balanceParams);
      console.log(usdBalFromSdk);
      setBalance({
        totalBalanceInUsd: usdBalFromSdk.data.totalBalance,
        alltokenBalances: balFromSdk.data,
      });
      setIsFetchingBalance(false);
      return "";
    } catch (error: any) {
      setIsFetchingBalance(false);
      console.log({ getSmartAccountBalance: error });
      return error.message;
    }
  };

  useEffect(() => {
    getSmartAccount();
  }, [getSmartAccount]);

  return (
    <SmartAccountContext.Provider
      value={{
        wallet,
        state,
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
