import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showSuccessMessage,
  showErrorMessage,
} from "../../utils";

const BatchMintNft: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);

  useEffect(() => {
    const getNftCount = async () => {
      if (!walletState?.address || !web3Provider) return;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      const count = await nftContract.balanceOf(walletState?.address);
      console.log("count", Number(count));
      setNftCount(Number(count));
    };
    getNftCount();
  }, [walletState?.address, web3Provider]);

  const mintNft = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      let smartAccount = wallet;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      console.log("smartAccount.address ", smartAccount.address);
      const safeMintTx = await nftContract.populateTransaction.safeMint(
        smartAccount.address
      );
      console.log(safeMintTx.data);
      const tx1 = {
        to: config.nft.address,
        data: safeMintTx.data,
      };
      const tx2 = {
        to: config.nft.address,
        data: safeMintTx.data,
      };

      const response = await smartAccount.sendGaslessTransactionBatch({
        transactions: [tx1, tx2],
      });

      showSuccessMessage(`Transaction sent: ${response.hash}`);

      // Note: txResponse.hash here is requestId and not transactionHash
      web3Provider.once(response.hash, (transaction: any) => {
        // Emitted when the transaction has been mined
        console.log("txn_mined:", transaction);
        showSuccessMessage(
          `Transaction mined: ${response.hash}`,
          response.hash
        );
      });
    } catch (err: any) {
      console.error(err);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} Batch Nft Mint
      </p>

      <h3 className={classes.subTitle}>Batch Nft Mint</h3>

      <p>
        This magic bundle will batch two signle safeMint into one transaction
      </p>

      <p>Nft Contract Address: {config.nft.address}</p>
      <p style={{ marginBottom: 30 }}>
        Nft Balance in SCW:{" "}
        {nftCount === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          nftCount
        )}
      </p>

      <h4 className={classes.h3Title}>Transaction Batched</h4>
      <ul style={{ margin: "0 0 20px 0" }}>
        <li>safeMint 1 nft</li>
        <li>safeMint 1 nft</li>
      </ul>

      <Button title="Mint Nft twice" onClickFunc={mintNft} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 28,
    margin: "0",
  },
  h3Title: {
    margin: 10,
  },
}));

export default BatchMintNft;
