import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { usePublicClient } from "wagmi";
import { Hex, encodeFunctionData, getContract } from "viem";
import Button from "../Button";
import { configInfo as config, showSuccessMessage } from "../../utils";
import {
  useSendTransaction,
  useSmartAccount,
  useUserOpWait,
} from "@biconomy/use-aa";
import { ErrorGuard } from "../../utils/ErrorGuard";
import { polygonAmoy } from "viem/chains";

const MintNft: React.FC = () => {
  const classes = useStyles();
  const publicClient = usePublicClient();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [loadedCount, setLoadedCount] = useState<boolean>(false);

  const { smartAccountAddress: scwAddress } = useSmartAccount();
  const {
    mutate,
    data: userOpResponse,
    error,
    isPending,
  } = useSendTransaction();
  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData,
  } = useUserOpWait(userOpResponse);

  const getNftCount = useCallback(async () => {
    if (!scwAddress || !publicClient) return;
    const nftContract = getContract({
      address: config.nft.address as Hex,
      abi: config.nft.abi,
      client: publicClient,
    });
    const count = await nftContract.read.balanceOf([scwAddress]);
    console.log("count", count);
    setNftCount(Number(count));
  }, [publicClient, scwAddress]);

  useEffect(() => {
    if (waitIsSuccess || !loadedCount) {
      getNftCount();
      setLoadedCount(true);
    }
  }, [getNftCount, waitIsSuccess]);

  useEffect(() => {
    waitIsSuccess &&
      showSuccessMessage(
        "Successful mint: " +
          `${polygonAmoy.blockExplorers.default.url}/tx/${waitData?.receipt?.transactionHash}`
      );
  }, [waitIsSuccess]);

  const mintNft = () =>
    mutate({
      transactions: {
        to: config.nft.address as Hex,
        data: encodeFunctionData({
          abi: config.nft.abi,
          functionName: "safeMint",
          args: [scwAddress as Hex],
        }),
      },
    });

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Gasless {"->"} Mint Nft
        </p>
        <h3 className={classes.subTitle}>Mint Nft Flow</h3>
        <p style={{ marginBottom: 20 }}>
          This is an example gasless transaction to Mint Nft.
        </p>
        <p>
          Nft Contract Address: {config.nft.address}{" "}
          <span style={{ fontSize: 13, color: "#FFB4B4" }}>
            (same of goerli, amoy, polygon)
          </span>
        </p>
        <p style={{ marginBottom: 30, marginTop: 30, fontSize: 24 }}>
          Nft Balance in SCW:{" "}
          <p style={{ color: "#7E7E7E", display: "contents" }}>
            {waitIsLoading ? "fetching..." : nftCount}
          </p>
        </p>
        <Button title="Mint NFT" isLoading={isPending} onClickFunc={mintNft} />
      </ErrorGuard>
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
}));

export default MintNft;
