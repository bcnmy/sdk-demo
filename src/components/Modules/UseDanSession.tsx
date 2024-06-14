import React, { useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo, showSuccessMessage } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { useSession, useUserOpWait } from "@biconomy/use-aa";
import { ErrorGuard } from "../../utils/ErrorGuard";

interface props {
  smartAccountAddress: Hex;
  address: string;
}

const UseDanSession: React.FC<props> = ({ smartAccountAddress }) => {
  const useDanSessionHandler = async () => {};

  const transactions = useMemo(
    () => ({
      to: configInfo.nft.address,
      data: encodeFunctionData({
        abi: parseAbi(["function safeMint(address _to)"]),
        functionName: "safeMint",
        args: [smartAccountAddress as Hex],
      }),
    }),
    [smartAccountAddress]
  );

  return <Button title="Minft NFT" onClickFunc={useDanSessionHandler} />;
};

export default UseDanSession;
