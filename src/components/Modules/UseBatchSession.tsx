import React, { useEffect } from "react";
import { Transaction } from "@biconomy/account";
import "react-toastify/dist/ReactToastify.css";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import Button from "../Button";
import { configInfo, showSuccessMessage } from "../../utils";
import { polygonAmoy } from "viem/chains";
import { useBatchSession, useUserOpWait, Options } from "@biconomy/use-aa";
import { ErrorGuard } from "../../utils/ErrorGuard";

interface props {
  smartAccountAddress?: Hex;
  address?: string;
}

const UseBatchSession: React.FC<props> = ({ smartAccountAddress }) => {
  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading,
  } = useBatchSession();

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData,
  } = useUserOpWait(userOpResponse);

  const nftMintTx: Transaction = {
    to: configInfo.nft.address,
    data: encodeFunctionData({
      abi: parseAbi(["function safeMint(address _to)"]),
      functionName: "safeMint",
      args: [smartAccountAddress as Hex],
    }),
  };

  const txTwice = () =>
    mutate({
      transactions: [nftMintTx, nftMintTx],
      correspondingIndexes: [0, 1],
      options: Options.getIncreasedVerification(50),
    });

  useEffect(() => {
    if (waitIsSuccess) {
      showSuccessMessage(
        "Successful mint: " +
          `${polygonAmoy.blockExplorers.default.url}/tx/${waitData?.receipt?.transactionHash}`
      );
    }
  }, [waitIsSuccess]);

  return (
    <ErrorGuard errors={[error, waitError]}>
      <Button
        title="Mint Twice"
        onClickFunc={txTwice}
        isLoading={isLoading || waitIsLoading}
      />
    </ErrorGuard>
  );
};

export default UseBatchSession;
