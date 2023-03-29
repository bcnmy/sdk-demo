import React, { useCallback, useEffect } from "react";

import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { formatBalance, showErrorMessage } from "../../utils";
import CoinLogo from "../../img/coin-logo.svg";
import BicoLogo from "../../img/bico-theme.svg";

const Assets: React.FC = () => {
  const { getSmartAccountBalance, isFetchingBalance, balance } =
    useSmartAccountContext();

  const getSmartAccountBalanceFunc = useCallback(async () => {
    const error = await getSmartAccountBalance();
    if (error) showErrorMessage(error);
  }, [getSmartAccountBalance]);

  useEffect(() => {
    getSmartAccountBalanceFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isFetchingBalance) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img src={BicoLogo} className="animate-pulse" alt="" />
      </div>
    );
  }

  return (
    <main className="flex w-full h-full flex-col items-start justify-start gap-8">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-4xl text-textPrimary">Your Assets</h1>
        <div className="flex gap-4 items-center justify-center">
          <p className="text-2xl text-white">My Balance</p>
          <p className="text-2xl text-textPrimary">
            $ {balance.totalBalanceInUsd}
          </p>
        </div>
      </div>
      <div className="w-full flex gap-8">
        {balance.alltokenBalances.map((token, ind) => (
          <div
            className="p-10 w-60 text-white aspect-square border-2 rounded-2xl border-white flex flex-col items-center gap-10 justify-between"
            key={ind}
          >
            <img
              className="w-20"
              src={token.logo_url}
              alt="Token Logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CoinLogo;
              }}
            />
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl">{token.contract_ticker_symbol}</h2>
              <p className="text-4xl text-textPrimary">
                {formatBalance(token.balance, token.contract_decimals)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Assets;
