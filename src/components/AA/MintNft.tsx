import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { usePublicClient } from "wagmi";
import { Hex, encodeFunctionData, getContract } from "viem";
import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";
import { PaymasterMode } from "@biconomy-devx/paymaster";

const MintNft: React.FC = () => {
  const classes = useStyles();
  const publicClient = usePublicClient();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getNftCount = useCallback(async () => {
    if (!scwAddress || !publicClient) return;
    const nftContract = getContract({
      address: config.nft.address as Hex,
      abi: config.nft.abi,
      publicClient,
    });
    const count = await nftContract.read.balanceOf([scwAddress]);
    console.log("count", count);
    setNftCount(Number(count));
  }, [publicClient, scwAddress]);

  useEffect(() => {
    getNftCount();
  }, [getNftCount, publicClient]);

  const mintNft = async () => {
    if (!scwAddress || !smartAccount || !publicClient) return;
    try {
      setLoading(true);
      const mintData = encodeFunctionData({
        abi: config.nft.abi,
        functionName: "safeMint",
        args: [scwAddress as Hex],
      });
      const tx1 = {
        to: config.nft.address as Hex,
        value: BigInt(0),
        data: mintData,
      };

      let { waitForTxHash } = await smartAccount.sendTransaction([tx1], { paymasterServiceData: { mode: PaymasterMode.SPONSORED } });
      const { transactionHash } = await waitForTxHash();
      console.log("txHash", transactionHash);
      showSuccessMessage(`Minted Nft ${transactionHash}`, transactionHash);
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getNftCount();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
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
          (same of goerli, mumbai, polygon)
        </span>
      </p>
      <p style={{ marginBottom: 30, marginTop: 30, fontSize: 24 }}>
        Nft Balance in SCW:{" "}
        {nftCount === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          nftCount
        )}
      </p>

      <Button title="Mint NFT" isLoading={loading} onClickFunc={mintNft} />
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
